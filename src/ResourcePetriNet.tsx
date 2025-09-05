import React, { useRef, useState, useEffect, useCallback } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import {
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Button,
} from "@mui/material";
import { BARALHO_INICIAL, BARALHO_OFERTA_INICIAL } from "./data/cartas.ts";

const OMEGA = "ω";

type NodeAttributes = {
  id: string;
  label: string;
  type: "place" | "transition";
  tokens?: number;
  size: 15 | 10;
  color: string;
  x?: number;
  y?: number;
};

type LinkAttributes = {
  source: string;
  target: string;
  weight: number;
  color: string;
};

type ResourcePetriNetProps = {
  recursos: Array<{ nome: string; quantidade: number }>;
  playableCards: Array<{ id: string }>;
};

export const NODE_COLORS = {
  place: "#4CAF50",
  transition: "#2196F3",
  activeTransition: "#FFC107",
};

export const LINK_COLORS = {
  input: "#F44336",
  output: "#4CAF50",
};

type Marcacao = Record<string, number | string>;

// ==================== TIPOS PARA ÁRVORE ====================
type NoArvore = {
  id: string;
  marcacao: Marcacao;
  transicaoDisparada?: string;
  paiId?: string;
  children: NoArvore[];
  ciclico?: boolean;
  terminal?: boolean;
  expandido: boolean;
};

const recursosParaMarcacao = (
  recursos: Array<{ nome: string; quantidade: number }>
): Marcacao => {
  const marcacao: Marcacao = {};
  recursos.forEach((r) => (marcacao[r.nome] = r.quantidade));
  return marcacao;
};

const getGraphBounds = (
  nodes: NodeAttributes[],
  width: number,
  height: number
) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  let hasValidNodes = false;

  nodes.forEach((d) => {
    if (d.x === undefined || d.y === undefined || isNaN(d.x) || isNaN(d.y)) {
      d.x = width / 2;
      d.y = height / 2;
    }

    const radius = d.size || 10;
    minX = Math.min(minX, d.x - radius);
    maxX = Math.max(maxX, d.x + radius);
    minY = Math.min(minY, d.y - radius);
    maxY = Math.max(maxY, d.y + radius);
    hasValidNodes = true;
  });

  if (!hasValidNodes) return null;

  const padding = 50;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
  };
};

// ==================== FUNÇÕES PARA ÁRVORE DE ALCANÇABILIDADE ====================

// Função para comparar marcações (considerando ω)
const compararMarcacoes = (m1: Marcacao, m2: Marcacao): boolean => {
  const chaves = new Set([...Object.keys(m1), ...Object.keys(m2)]);

  for (const chave of chaves) {
    const v1 = m1[chave] || 0;
    const v2 = m2[chave] || 0;

    // Se ambos são ω, continuar
    if (v1 === OMEGA && v2 === OMEGA) continue;

    // Se um é ω e o outro não, são diferentes
    if (v1 === OMEGA || v2 === OMEGA) return false;

    // Comparação numérica
    if (Number(v1) !== Number(v2)) return false;
  }

  return true;
};

// Função para verificar se uma marcação domina outra (para detectar ω)
const marcaçãoDomina = (nova: Marcacao, existente: Marcacao): boolean => {
  const chaves = new Set([...Object.keys(nova), ...Object.keys(existente)]);

  let dominaEstritamente = false;

  for (const chave of chaves) {
    const vNova = nova[chave] || 0;
    const vExistente = existente[chave] || 0;

    // Se o existente já é ω, a nova não pode dominá-lo
    if (vExistente === OMEGA) continue;

    // Se a nova é ω, domina qualquer valor finito
    if (vNova === OMEGA) return true;

    // Comparação numérica - se a nova é MENOR em algum recurso, NÃO domina
    if (Number(vNova) < Number(vExistente)) {
      return false;
    }

    // Se a nova é MAIOR em algum recurso, pode dominar
    if (Number(vNova) > Number(vExistente)) {
      dominaEstritamente = true;
    }
  }

  // Só domina se for maior ou igual em TODOS os recursos e estritamente maior em pelo menos um
  return dominaEstritamente;
};

const ResourcePetriNetComArvore: React.FC<ResourcePetriNetProps> = ({
  recursos,
  playableCards,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [petriNetInitialized, setPetriNetInitialized] = useState(false);
  const simulationRef = useRef<any>(null);
  const graphRef = useRef<MultiDirectedGraph<
    NodeAttributes,
    LinkAttributes
  > | null>(null);
  const nodeGroupsRef = useRef<any>(null);

  const [marcacaoModoLivre, setMarcacaoModoLivre] = useState<Marcacao>(
    recursos.reduce((acc, r) => ({ ...acc, [r.nome]: 0 }), {})
  );

  // REF para armazenar a marcação atual do modo livre
  const marcacaoModoLivreRef = useRef<Marcacao>(marcacaoModoLivre);

  useEffect(() => {
    marcacaoModoLivreRef.current = marcacaoModoLivre;
  }, [marcacaoModoLivre]);

  const [transicoesHabilitadas, setTransicoesHabilitadas] = useState<string[]>(
    []
  );
  const [modoLivre, setModoLivre] = useState(false);
  const modoLivreRef = useRef(modoLivre);
  const [loading, setLoading] = useState(false);

  // ==================== ESTADOS DA ÁRVORE ====================
  const [arvore, setArvore] = useState<NoArvore | null>(null);
  const [expandindoArvore, setExpandindoArvore] = useState(false);
  const [mostrarArvore, setMostrarArvore] = useState(false);

  useEffect(() => {
    modoLivreRef.current = modoLivre;
  }, [modoLivre]);

  const getMarcacaoAtual = useCallback(() => {
    return modoLivre ? marcacaoModoLivre : recursosParaMarcacao(recursos);
  }, [modoLivre, marcacaoModoLivre, recursos]);

  const isTransicaoHabilitada = useCallback(
    (
      transicaoId: string,
      marcacao: Marcacao,
      playableCards: Array<{ id: string }>,
      graph: MultiDirectedGraph<NodeAttributes, LinkAttributes> | null,
      modoLivre: boolean = false
    ): boolean => {
      if (!graph) return false;

      try {
        const cartaId = transicaoId.replace("transition_", "");

        if (!modoLivre) {
          const cartaJogavel = playableCards.some(
            (card) => card.id === cartaId
          );
          if (!cartaJogavel) return false;
        }

        const arcosEntrada = graph.inEdges(transicaoId) || [];

        for (const arcoId of arcosEntrada) {
          const arcoAttr = graph.getEdgeAttributes(arcoId);
          const lugarId = graph.source(arcoId);

          if (!graph.hasNode(lugarId)) continue;

          const recursoNome = graph.getNodeAttribute(lugarId, "label");
          const pesoNecessario = arcoAttr.weight || 0;

          if (marcacao[recursoNome] === OMEGA) continue;

          const quantidadeAtual = (marcacao[recursoNome] as number) || 0;
          if (quantidadeAtual < pesoNecessario) {
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Erro ao verificar transição habilitada:", error);
        return false;
      }
    },
    []
  );

  const dispararTransicao = useCallback(
    (
      transicaoId: string,
      marcacao: Marcacao,
      graph: MultiDirectedGraph<NodeAttributes, LinkAttributes> | null
    ): Marcacao => {
      if (!graph) return { ...marcacao };

      const novaMarcacao = { ...marcacao };

      console.log(`=== Disparando transição ${transicaoId} ===`);

      try {
        // ===== Arcos de entrada =====
        const arcosEntrada = graph.inEdges(transicaoId) || [];
        console.log("Arcos de entrada encontrados: ", arcosEntrada);

        for (const arcoId of arcosEntrada) {
          const arcoAttr = graph.getEdgeAttributes(arcoId);
          const lugarId = graph.source(arcoId);

          if (!graph.hasNode(lugarId)) continue;

          const recursoNome = graph.getNodeAttribute(lugarId, "label");
          const peso = arcoAttr.weight || 0;

          if (novaMarcacao[recursoNome] === OMEGA) continue;

          const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
          novaMarcacao[recursoNome] = Math.max(0, quantidadeAtual - peso);
        }

        // ===== Arcos de saída =====
        const arcosSaida = graph.outEdges(transicaoId) || [];
        console.log("Arcos de saída encontrados: ", arcosSaida);

        for (const arcoId of arcosSaida) {
          const arcoAttr = graph.getEdgeAttributes(arcoId);
          const lugarId = graph.target(arcoId);

          if (!graph.hasNode(lugarId)) continue;

          const recursoNome = graph.getNodeAttribute(lugarId, "label");
          const peso = arcoAttr.weight || 0;

          if (novaMarcacao[recursoNome] === OMEGA) continue;

          const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
          novaMarcacao[recursoNome] = quantidadeAtual + peso;
        }

        console.log("Marcação final após disparo: ", novaMarcacao);
      } catch (error) {
        console.error("Erro ao disparar transição:", error);
      }

      return novaMarcacao;
    },
    []
  );

  // Função para expandir a árvore recursivamente
  const expandirNoArvore = (
    no: NoArvore,
    graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
    playableCards: Array<{ id: string }>,
    caminhoAncestrais: NoArvore[],
    contadorNos: { count: number }
  ): NoArvore => {
    // Verificar se já existe um nó com mesma marcação no caminho atual
    const noExistente = caminhoAncestrais.find((n) =>
      compararMarcacoes(n.marcacao, no.marcacao)
    );

    if (noExistente && noExistente !== no) {
      // Se encontramos um ciclo, marcar como cíclico
      no.ciclico = true;
      no.terminal = true;
      return no;
    }

    // Criar novo caminho com este nó incluído
    const novoCaminho = [...caminhoAncestrais, no];

    // Encontrar todas as transições habilitadas nesta marcação
    const transicoesHabilitadas = graph
      .nodes()
      .filter((node) => graph.getNodeAttribute(node, "type") === "transition")
      .filter((transicaoId) =>
        isTransicaoHabilitada(
          transicaoId,
          no.marcacao,
          playableCards,
          graph,
          true // modo livre para árvore
        )
      );

    // Se não há transições habilitadas, é nó terminal
    if (transicoesHabilitadas.length === 0) {
      no.terminal = true;
      return no;
    }

    // Expandir cada transição habilitada
    for (const transicaoId of transicoesHabilitadas) {
      const novaMarcacao = dispararTransicao(transicaoId, no.marcacao, graph);

      // Verificar se esta nova marcação domina algum ancestral no caminho
      let precisaOmega = false;

      for (const ancestral of novoCaminho) {
        if (marcaçãoDomina(novaMarcacao, ancestral.marcacao)) {
          precisaOmega = true;
          // Substituir valores por ω onde há dominância
          Object.keys(novaMarcacao).forEach((chave) => {
            const valorAtual = novaMarcacao[chave];
            const valorAncestral = ancestral.marcacao[chave] || 0;

            if (
              valorAtual !== OMEGA &&
              valorAncestral !== OMEGA &&
              Number(valorAtual) > Number(valorAncestral)
            ) {
              novaMarcacao[chave] = OMEGA;
            }
          });
          break;
        }
      }

      contadorNos.count++;
      const novoNo: NoArvore = {
        id: `n${contadorNos.count}`,
        marcacao: novaMarcacao,
        transicaoDisparada: transicaoId.replace("transition_", ""),
        paiId: no.id,
        children: [],
        expandido: false, // Mudar para false inicialmente
      };

      no.children.push(novoNo);

      // Expandir recursivamente (a menos que seja ω)
      if (!precisaOmega) {
        expandirNoArvore(
          novoNo,
          graph,
          playableCards,
          novoCaminho,
          contadorNos
        );
      } else {
        novoNo.terminal = true;
        novoNo.expandido = true;
      }
    }

    no.expandido = true;
    return no;
  };

  const handleNodeClick = useCallback(
    (nodeLabel: string) => {
      if (!modoLivreRef.current) return;

      setLoading(true);
      try {
        setMarcacaoModoLivre((prevMarcacao) => {
          const novaMarcacao = { ...prevMarcacao };
          const valorAtual = novaMarcacao[nodeLabel];

          if (valorAtual === OMEGA) {
            novaMarcacao[nodeLabel] = OMEGA;
          } else {
            novaMarcacao[nodeLabel] = ((valorAtual as number) || 0) + 1;
          }

          // Atualiza visualmente imediatamente
          setTimeout(() => {
            if (petriNetInitialized) updatePetriNet();
          }, 0);

          return novaMarcacao;
        });
      } finally {
        setLoading(false);
      }
    },
    [petriNetInitialized]
  );

  const testarDisparoTransicao = (transicaoId: string) => {
    if (!graphRef.current) return;

    setLoading(true);

    try {
      const currentMarcacao = { ...marcacaoModoLivreRef.current };
      console.log("Tokens antes do disparo: ", currentMarcacao);

      // Confirma que a transição existe exatamente no graph
      if (!graphRef.current.hasNode(transicaoId)) {
        console.warn("Transição não encontrada no graph:", transicaoId);
        return;
      }

      const habilitada = isTransicaoHabilitada(
        transicaoId,
        currentMarcacao,
        playableCards,
        graphRef.current,
        modoLivreRef.current
      );

      if (!habilitada) {
        console.log("Transição não habilitada:", transicaoId);
        return;
      }

      const novaMarcacao = dispararTransicao(
        transicaoId,
        currentMarcacao,
        graphRef.current
      );

      console.log("Tokens depois do disparo: ", novaMarcacao);
      console.log(
        "Transição disparada:",
        transicaoId.replace("transition_", "")
      );

      if (modoLivreRef.current) {
        setMarcacaoModoLivre(novaMarcacao);

        // Atualiza visualmente
        setTimeout(() => {
          if (petriNetInitialized) updatePetriNet();
        }, 0);
      }
    } catch (error) {
      console.error("Erro ao testar disparo da transição:", error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarTransicoesHabilitadas = useCallback(() => {
    if (!graphRef.current) {
      setTransicoesHabilitadas([]);
      return;
    }

    try {
      const currentMarcacao = getMarcacaoAtual();
      const habilitadas = graphRef.current
        .nodes()
        .filter(
          (node) =>
            graphRef.current?.getNodeAttribute(node, "type") === "transition"
        )
        .filter((transicaoId) =>
          isTransicaoHabilitada(
            transicaoId,
            currentMarcacao,
            playableCards,
            graphRef.current,
            modoLivre
          )
        );

      setTransicoesHabilitadas(habilitadas);
    } catch (error) {
      console.error("Erro ao atualizar transições habilitadas:", error);
      setTransicoesHabilitadas([]);
    }
  }, [getMarcacaoAtual, playableCards, modoLivre]);

  const handleModoLivreChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading(true);
    try {
      const novoModoLivre = event.target.checked;
      setModoLivre(novoModoLivre);

      if (nodeGroupsRef.current) {
        nodeGroupsRef.current.each(function (this: SVGGElement, d: any) {
          if (d.type === "place") {
            d3.select(this)
              .select("circle")
              .style("cursor", novoModoLivre ? "pointer" : "default");
            d3.select(this)
              .select(".token-count")
              .style("cursor", novoModoLivre ? "pointer" : "default");
          }
        });
      }
    } catch (error) {
      console.error("Erro ao alterar modo livre:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetModoLivre = () => {
    setMarcacaoModoLivre(
      recursos.reduce((acc, r) => ({ ...acc, [r.nome]: 0 }), {})
    );
  };

  const initPetriNet = () => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const graph = new MultiDirectedGraph<NodeAttributes, LinkAttributes>();
    graphRef.current = graph;

    const allCards = [...BARALHO_INICIAL, ...BARALHO_OFERTA_INICIAL];

    // === Adiciona transições ===
    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;
      graph.addNode(transitionId, {
        id: transitionId,
        label: carta.titulo,
        type: "transition",
        size: 10,
        color: NODE_COLORS.transition,
      });
    });

    // === Adiciona lugares ===
    const allResources = new Set<string>();
    allCards.forEach((carta) => {
      [...carta.ganho, ...carta.custo].forEach((recurso) => {
        allResources.add(recurso.nome);
      });
    });

    allResources.forEach((nome) => {
      graph.addNode(`place_${nome}`, {
        id: `place_${nome}`,
        label: nome,
        type: "place",
        tokens: 0,
        size: 15,
        color: NODE_COLORS.place,
      });
    });

    // === Adiciona arcos corretamente ===
    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;

      // Arcos de custo (entrada)
      carta.custo.forEach((custo) => {
        const placeId = `place_${custo.nome}`;
        if (graph.hasNode(placeId)) {
          const edgeId = graph.addDirectedEdge(placeId, transitionId);
          graph.setEdgeAttribute(edgeId, "weight", custo.quantidade);
          graph.setEdgeAttribute(edgeId, "color", LINK_COLORS.input);
          graph.setEdgeAttribute(edgeId, "source", placeId);
          graph.setEdgeAttribute(edgeId, "target", transitionId);
        }
      });

      // Arcos de ganho (saída)
      carta.ganho.forEach((ganho) => {
        const placeId = `place_${ganho.nome}`;
        if (graph.hasNode(placeId)) {
          const edgeId = graph.addDirectedEdge(transitionId, placeId);
          graph.setEdgeAttribute(edgeId, "weight", ganho.quantidade);
          graph.setEdgeAttribute(edgeId, "color", LINK_COLORS.output);
          graph.setEdgeAttribute(edgeId, "source", transitionId);
          graph.setEdgeAttribute(edgeId, "target", placeId);
        }
      });
    });

    // === Preparação dos nós e links para D3 ===
    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    const g = svg.append("g");

    // === Zoom ===
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoomBehavior);

    // === Simulação de força ===
    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-100))
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(90)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    // === Definição de setas nos links ===
    const defs = svg.append("defs");
    Object.values(LINK_COLORS).forEach((color) => {
      defs
        .append("marker")
        .attr("id", `arrowhead-${color.replace("#", "")}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M 0,-5 L 10,0 L 0,5")
        .attr("fill", color);
    });

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2)
      .attr(
        "marker-end",
        (d: any) => `url(#arrowhead-${d.color.replace("#", "")})`
      );

    // === Criação dos nós no SVG ===
    nodeGroupsRef.current = g
      .append("g")
      .selectAll("g")
      .data(nodes, (d: any) => d.id)
      .enter()
      .append("g")
      .attr("data-id", (d: any) => d.id)
      .call(
        d3
          .drag<SVGGElement, NodeAttributes>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // === Conteúdo dos nós ===
    nodeGroupsRef.current.each(function (this: SVGGElement, d: NodeAttributes) {
      const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);

      if (d.type === "place") {
        nodeGroup
          .append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("cursor", modoLivre ? "pointer" : "default")
          .on("click", () => handleNodeClick(d.label));

        nodeGroup
          .append("text")
          .attr("class", "token-count")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-weight", "bold")
          .style("cursor", modoLivre ? "pointer" : "default")
          .text(getMarcacaoAtual()[d.label] || 0)
          .on("click", () => handleNodeClick(d.label));

        nodeGroup
          .append("text")
          .attr("dy", d.size + 15)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-size", "10px")
          .text(d.label);
      } else {
        nodeGroup
          .append("rect")
          .attr("class", "transition-node")
          .attr("width", 5)
          .attr("height", 40)
          .attr("x", -2.5)
          .attr("y", -20)
          .attr("rx", 2)
          .attr("fill", d.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("click", () => testarDisparoTransicao(d.id));

        nodeGroup
          .append("text")
          .attr("dy", 25)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-size", "10px")
          .text(d.label);
      }
    });

    // === Labels dos links ===
    g.append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 10)
      .attr("fill", (d: any) => d.color)
      .text((d: any) => d.weight);

    // === Atualização da simulação ===
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x)
        .attr("y1", (d: any) => (d.source as any).y)
        .attr("x2", (d: any) => (d.target as any).x)
        .attr("y2", (d: any) => (d.target as any).y);

      nodeGroupsRef.current.attr(
        "transform",
        (d: any) => `translate(${d.x},${d.y})`
      );

      g.selectAll("text")
        .attr("x", (d: any) =>
          d.source && d.target ? (d.source.x + d.target.x) / 2 : 0
        )
        .attr("y", (d: any) =>
          d.source && d.target ? (d.source.y + d.target.y) / 2 : 0
        );
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Ajusta zoom inicial
    setTimeout(() => {
      const bounds = getGraphBounds(nodes, width, height);
      if (bounds) {
        const { minX, maxX, minY, maxY } = bounds;
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        const scale = Math.min(
          (width - 100) / graphWidth,
          (height - 100) / graphHeight,
          1.0
        );
        const translate = [
          (width - graphWidth * scale) / 2 - minX * scale,
          (height - graphHeight * scale) / 2 - minY * scale,
        ];
        g.transition()
          .duration(1000)
          .attr(
            "transform",
            `translate(${translate[0]},${translate[1]}) scale(${scale})`
          );
      }
      setPetriNetInitialized(true);
    }, 500);
  };

  const updatePetriNet = () => {
    if (!petriNetInitialized || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentMarcacao = getMarcacaoAtual();

    svg.selectAll<SVGTextElement, any>(".token-count").text(function () {
      const parentData: any = d3.select(this.parentNode as Element).datum();
      if (!parentData || parentData.type !== "place") return "0";
      return String(currentMarcacao[parentData.label] ?? 0);
    });

    svg
      .selectAll<SVGRectElement, any>(".transition-node")
      .attr("fill", function () {
        const nodeData: any = d3.select(this.parentNode as Element).datum();
        if (!nodeData || nodeData.type !== "transition")
          return nodeData?.color ?? NODE_COLORS.transition;

        const isHabilitada = isTransicaoHabilitada(
          nodeData.id,
          currentMarcacao,
          playableCards,
          graphRef.current,
          modoLivre
        );

        return isHabilitada
          ? NODE_COLORS.activeTransition
          : NODE_COLORS.transition;
      });
  };

  const gerarArvoreAlcancabilidade = () => {
    if (!graphRef.current) return;

    setExpandindoArvore(true);
    setMostrarArvore(true);

    setTimeout(() => {
      try {
        const marcacaoInicial = getMarcacaoAtual();
        const contadorNos = { count: 0 };

        const raiz: NoArvore = {
          id: "n0",
          marcacao: marcacaoInicial,
          children: [],
          expandido: false,
        };

        expandirNoArvore(
          raiz,
          graphRef.current!,
          playableCards,
          [],
          contadorNos
        );

        // DEBUG: Verificar a estrutura da árvore
        console.log("Árvore gerada:", JSON.stringify(raiz, null, 2));
        console.log("Total de nós:", contadorNos.count);

        setArvore(raiz);
      } catch (error) {
        console.error("Erro ao gerar árvore:", error);
      } finally {
        setExpandindoArvore(false);
      }
    }, 100);
  };

const renderArvore = useCallback(
  (arvore: NoArvore) => {
    if (!mostrarArvore) return;

    const treeContainer = document.getElementById("arvore-container");
    if (!treeContainer) return;

    treeContainer.innerHTML = "";

    const width = treeContainer.clientWidth;
    const height = treeContainer.clientHeight;

    const svg = d3
      .select(treeContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Adicionar um grupo principal para o zoom
    const g = svg.append("g");

    // Configurar o comportamento de zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Aplicar o zoom ao SVG
    svg.call(zoomBehavior);

    // Coletar todos os nós da árvore
    const todosNos: NoArvore[] = [];
    const coletarNos = (no: NoArvore) => {
      todosNos.push(no);
      no.children.forEach(coletarNos);
    };
    coletarNos(arvore);

    // Criar links entre os nós
    const links: Array<{ source: string; target: string; label: string }> = [];
    const processarLinks = (no: NoArvore) => {
      no.children.forEach((filho) => {
        links.push({
          source: no.id,
          target: filho.id,
          label: filho.transicaoDisparada || "",
        });
        processarLinks(filho);
      });
    };
    processarLinks(arvore);

    // Preparar dados para o D3 force layout
    const nodesData = todosNos.map((no) => ({
      id: no.id,
      marcacao: no.marcacao,
      ciclico: no.ciclico,
      terminal: no.terminal,
      type: "state",
      size: 25,
      label: no.id.replace("n", "M"),
    }));

    const linksData = links.map((link) => ({
      source: link.source,
      target: link.target,
      label: link.label,
      color: "#999",
    }));

    // Configurar a simulação de força
    const simulation = d3
      .forceSimulation(nodesData as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(linksData)
          .id((d: any) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Desenhar links
    const link = g
      .append("g")
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2);

    // Adicionar setas aos links
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#999");

    link.attr("marker-end", "url(#arrowhead)");

    // Adicionar labels aos links (transições)
    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(linksData)
      .enter()
      .append("text")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .text((d: any) => d.label);

    // Desenhar nós
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Adicionar círculos aos nós
    node
      .append("circle")
      .attr("r", (d: any) => d.size)
      .attr("fill", (d: any) => {
        if (d.ciclico) return "#FFC107"; // Amarelo para cíclico
        if (d.terminal) return "#f44336"; // Vermelho para terminal
        return "#4CAF50"; // Verde para normal
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Adicionar ID do nó
    node
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text((d: any) => d.label);

    // Adicionar marcação como tooltip
    node.append("title").text((d: any) => {
      const marcacaoStr = Object.entries(d.marcacao)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      return `Marcação:\n${marcacaoStr}`;
    });

    // Atualizar posições durante a simulação
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Adicionar instruções de uso do zoom
    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .style("font-size", "12px")
      .text("Use scroll para zoom | Arraste para mover nós");

    // Centralizar a visualização após um breve delay
    setTimeout(() => {
      // Calcular os limites do gráfico
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      
      nodesData.forEach((d: any) => {
        if (d.x !== undefined) {
          minX = Math.min(minX, d.x);
          maxX = Math.max(maxX, d.x);
          minY = Math.min(minY, d.y);
          maxY = Math.max(maxY, d.y);
        }
      });

      // Adicionar margens
      const padding = 50;
      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      // Calcular escala e translação
      const scale = Math.min(
        (width - 100) / graphWidth,
        (height - 100) / graphHeight,
        1.0
      );
      
      const translate = [
        (width - graphWidth * scale) / 2 - minX * scale,
        (height - graphHeight * scale) / 2 - minY * scale,
      ];

      // Aplicar transformação
      g.transition()
        .duration(1000)
        .attr(
          "transform",
          `translate(${translate[0]},${translate[1]}) scale(${scale})`
        );
    }, 1000);
  },
  [mostrarArvore]
);


  useEffect(() => {
    if (arvore) {
      renderArvore(arvore);
    }
  }, [arvore, renderArvore]);

  useEffect(() => {
    atualizarTransicoesHabilitadas();
  }, [recursos, playableCards, modoLivre, marcacaoModoLivre]);

  useEffect(() => {
    if (!petriNetInitialized) {
      initPetriNet();
    }
  }, [petriNetInitialized]);

  useEffect(() => {
    if (petriNetInitialized) {
      updatePetriNet();
      atualizarTransicoesHabilitadas();
    }
  }, [
    marcacaoModoLivre,
    recursos,
    playableCards,
    petriNetInitialized,
    modoLivre,
  ]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper
        sx={{
          height: "600px",
          minWidth: "800px",
          position: "relative",
          backgroundColor: "#363636",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.837)",
        }}
      >
        <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: 2,
            borderRadius: 1,
            maxWidth: "400px",
            maxHeight: "500px",
            overflow: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <h3>Teste - Rede de Petri</h3>

          <FormControlLabel
            control={
              <Switch
                checked={modoLivre}
                onChange={handleModoLivreChange}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography>Modo Livre</Typography>
                {modoLivre && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "green",
                      animation: "pulse 1s infinite",
                    }}
                  />
                )}
              </Box>
            }
            sx={{ mb: 1 }}
          />

          {modoLivre && (
            <button
              onClick={resetModoLivre}
              style={{
                marginBottom: "10px",
                padding: "5px 10px",
                fontSize: "12px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              disabled={loading}
            >
              Resetar Modo Livre
            </button>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={gerarArvoreAlcancabilidade}
            disabled={expandindoArvore || loading}
            sx={{ mb: 2 }}
          >
            {expandindoArvore ? "Expandindo..." : "Gerar Árvore"}
          </Button>

          {loading && (
            <Typography variant="body2" color="primary">
              Carregando...
            </Typography>
          )}

          <p>
            <strong>Modo:</strong> {modoLivre ? "Livre" : "Normal"}
          </p>

          <p>
            <strong>Marcação Atual:</strong>
          </p>
          <pre
            style={{
              fontSize: "10px",
              backgroundColor: "#f5f5f5",
              padding: "5px",
              borderRadius: "3px",
            }}
          >
            {JSON.stringify(getMarcacaoAtual(), null, 2)}
          </pre>

          <p>
            <strong>
              Transições Habilitadas ({transicoesHabilitadas.length}):
            </strong>
          </p>
          <ul
            style={{
              fontSize: "10px",
              paddingLeft: "15px",
              marginBottom: "10px",
            }}
          >
            {transicoesHabilitadas.map((id) => (
              <li key={id} style={{ marginBottom: "3px" }}>
                {id.replace("transition_", "")}
                <button
                  onClick={() => testarDisparoTransicao(id)}
                  style={{
                    marginLeft: "10px",
                    fontSize: "8px",
                    padding: "2px 5px",
                  }}
                  disabled={loading}
                >
                  Disparar
                </button>
              </li>
            ))}
          </ul>

          {transicoesHabilitadas.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              Nenhuma transição habilitada no momento
            </Typography>
          )}
        </Box>
      </Paper>

      {mostrarArvore && (
        <Paper
          sx={{
            height: "600px",
            minWidth: "800px",
            backgroundColor: "#363636",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          <Box sx={{ p: 2, color: "white" }}>
            <h3>Árvore de Alcançabilidade</h3>
            {expandindoArvore && (
              <Typography variant="body2" color="primary">
                Expandindo árvore...
              </Typography>
            )}
          </Box>

          <Box id="arvore-container" sx={{ width: "100%", height: "550px" }} />
        </Paper>
      )}
    </Box>
  );
};

export default ResourcePetriNetComArvore;
