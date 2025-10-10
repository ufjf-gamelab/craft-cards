import React, { useRef, useState, useEffect } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import {
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Chip,
  Slider,
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
  nivel: number;
  simulacao?: boolean; // Para nós da simulação (expansões adicionais)
  omega?: boolean;     // Para nós com marcação omega (infinito)
};

// CORES DISTINTAS PARA CADA TIPO DE NÓ
const CORES_NOS = {
  inicial: "#2196F3",      // Azul - Estado inicial
  real: "#4CAF50",         // Verde - Nó real da árvore principal
  realIntermediario: "#388E3C", // Verde escuro - Nó real intermediário
  omega: "#F44336",        // Vermelho - Nó com omega (árvore principal)
  ciclico: "#FF9800",      // Laranja - Nó cíclico
  terminal: "#795548",     // Marrom - Nó terminal
  simulacao: "#9C27B0",    // Roxo - Nó da simulação
  simulacaoIntermediario: "#7B1FA2", // Roxo escuro - Nó intermediário da simulação
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

const compararMarcacoes = (m1: Marcacao, m2: Marcacao): boolean => {
  const chaves = new Set([...Object.keys(m1), ...Object.keys(m2)]);

  for (const chave of chaves) {
    const v1 = m1[chave] || 0;
    const v2 = m2[chave] || 0;

    if (v1 === OMEGA && v2 === OMEGA) continue;
    if (v1 === OMEGA || v2 === OMEGA) return false;
    if (Number(v1) !== Number(v2)) return false;
  }

  return true;
};

const marcaçãoDomina = (nova: Marcacao, existente: Marcacao): boolean => {
  const chaves = new Set([...Object.keys(nova), ...Object.keys(existente)]);

  let dominaEstritamente = false;

  for (const chave of chaves) {
    const vNova = nova[chave] || 0;
    const vExistente = existente[chave] || 0;

    if (vExistente === OMEGA) continue;
    if (vNova === OMEGA) return true;

    if (Number(vNova) < Number(vExistente)) {
      return false;
    }

    if (Number(vNova) > Number(vExistente)) {
      dominaEstritamente = true;
    }
  }

  return dominaEstritamente;
};

// FUNÇÕES AUXILIARES PARA EXPANSÃO DA ÁRVORE
const isTransicaoHabilitada = (
  transicaoId: string,
  marcacao: Marcacao,
  playableCards: Array<{ id: string }>,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
  modoLivre: boolean = false
): boolean => {
  if (!graph) return false;

  try {
    const cartaId = transicaoId.replace("transition_", "");

    if (!modoLivre) {
      const cartaJogavel = playableCards.some((card) => card.id === cartaId);
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
};

const dispararTransicao = (
  transicaoId: string,
  marcacao: Marcacao,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>
): Marcacao => {
  if (!graph) return { ...marcacao };

  const novaMarcacao = { ...marcacao };

  try {
    // ===== Arcos de entrada =====
    const arcosEntrada = graph.inEdges(transicaoId) || [];

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
  } catch (error) {
    console.error("Erro ao disparar transição:", error);
  }

  return novaMarcacao;
};

// NOVA FUNÇÃO: Expandir árvore completa com simulação
const expandirArvoreComSimulacao = (
  raiz: NoArvore,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
  playableCards: Array<{ id: string }>,
  numeroExpansoes: number
): NoArvore => {
  const contadorNos = { count: 0 };
  const contadorSimulacao = { count: 0 };
  
  // Primeiro, expandir a árvore normal (sem omega)
  const expandirNormalmente = (no: NoArvore, caminhoAncestrais: NoArvore[] = []): NoArvore => {
    if (no.terminal || no.ciclico) return no;
    
    const noExistente = caminhoAncestrais.find((n) =>
      compararMarcacoes(n.marcacao, no.marcacao)
    );

    if (noExistente && noExistente !== no) {
      no.ciclico = true;
      no.terminal = true;
      return no;
    }

    const novoCaminho = [...caminhoAncestrais, no];
    const transicoesHabilitadas = graph
      .nodes()
      .filter((node) => graph.getNodeAttribute(node, "type") === "transition")
      .filter((transicaoId) =>
        isTransicaoHabilitada(
          transicaoId,
          no.marcacao,
          playableCards,
          graph,
          true
        )
      );

    if (transicoesHabilitadas.length === 0) {
      no.terminal = true;
      return no;
    }

    for (const transicaoId of transicoesHabilitadas.slice(0, 10)) {
      const novaMarcacao = dispararTransicao(transicaoId, no.marcacao, graph);

      // Verificar se precisa de omega
      let precisaOmega = false;
      for (const ancestral of novoCaminho) {
        if (marcaçãoDomina(novaMarcacao, ancestral.marcacao)) {
          precisaOmega = true;
          // Aplicar omega onde necessário
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
        expandido: false,
        nivel: no.nivel + 1,
        omega: precisaOmega, // Marcar como omega se tiver valores infinitos
        simulacao: false, // Nós da árvore principal não são simulação
      };

      no.children.push(novoNo);

      if (!precisaOmega) {
        expandirNormalmente(novoNo, novoCaminho);
      } else {
        // Nós omega são terminais na árvore principal (a menos que haja simulação)
        novoNo.terminal = numeroExpansoes === 0;
      }
    }

    no.expandido = true;
    return no;
  };

  // Expandir árvore normalmente primeiro
  let arvoreExpandida = expandirNormalmente(raiz);

  // AGORA aplicar a simulação nos nós omega apenas se numeroExpansoes > 0
  if (numeroExpansoes > 0) {
    const nosOmega: NoArvore[] = [];
    
    // Coletar todos os nós omega que não são terminais
    const coletarNosOmega = (no: NoArvore) => {
      if (no.omega && !no.terminal && !no.simulacao) {
        nosOmega.push(no);
      }
      no.children.forEach(coletarNosOmega);
    };
    coletarNosOmega(arvoreExpandida);

    // Expandir cada nó omega N vezes
    const expandirOmegaRecursivo = (no: NoArvore, expansoesRestantes: number, profundidade: number = 0): void => {
      if (expansoesRestantes <= 0 || profundidade > 50 || contadorNos.count > 200) {
        no.terminal = true;
        return;
      }

      const transicoesHabilitadas = graph
        .nodes()
        .filter((node) => graph.getNodeAttribute(node, "type") === "transition")
        .filter((transicaoId) =>
          isTransicaoHabilitada(
            transicaoId,
            no.marcacao,
            playableCards,
            graph,
            true
          )
        );

      if (transicoesHabilitadas.length === 0) {
        no.terminal = true;
        return;
      }

      for (const transicaoId of transicoesHabilitadas.slice(0, 5)) {
        const novaMarcacao = { ...no.marcacao };
        
        // Aplicar transição
        const arcosEntrada = graph.inEdges(transicaoId) || [];
        const arcosSaida = graph.outEdges(transicaoId) || [];

        for (const arcoId of arcosEntrada) {
          const arcoAttr = graph.getEdgeAttributes(arcoId);
          const lugarId = graph.source(arcoId);
          const recursoNome = graph.getNodeAttribute(lugarId, "label");
          const peso = arcoAttr.weight || 0;

          if (novaMarcacao[recursoNome] !== OMEGA) {
            const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
            novaMarcacao[recursoNome] = Math.max(0, quantidadeAtual - peso);
          }
        }

        for (const arcoId of arcosSaida) {
          const arcoAttr = graph.getEdgeAttributes(arcoId);
          const lugarId = graph.target(arcoId);
          const recursoNome = graph.getNodeAttribute(lugarId, "label");
          const peso = arcoAttr.weight || 0;

          if (novaMarcacao[recursoNome] !== OMEGA) {
            const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
            novaMarcacao[recursoNome] = quantidadeAtual + peso;
          }
        }

        contadorSimulacao.count++;
        const novoNo: NoArvore = {
          id: `s${contadorSimulacao.count}`,
          marcacao: novaMarcacao,
          transicaoDisparada: transicaoId.replace("transition_", ""),
          paiId: no.id,
          children: [],
          expandido: false,
          nivel: no.nivel + 1,
          simulacao: true, // Filhos de omega são simulação
          omega: false, // Nós de simulação não são omega (já processado)
        };

        no.children.push(novoNo);

        // Expandir recursivamente o novo nó
        expandirOmegaRecursivo(novoNo, expansoesRestantes - 1, profundidade + 1);
      }

      no.expandido = true;
    };

    // Expandir cada nó omega
    nosOmega.forEach(noOmega => {
      expandirOmegaRecursivo(noOmega, numeroExpansoes);
    });
  }

  return arvoreExpandida;
};

const ResourcePetriNetComArvore: React.FC<ResourcePetriNetProps> = ({
  recursos,
  playableCards,
}) => {
  // ========== REFs PARA CONTROLE INTERNO D3 ==========
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<any>(null);
  const graphRef = useRef<MultiDirectedGraph<
    NodeAttributes,
    LinkAttributes
  > | null>(null);
  const nodeGroupsRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // ========== ESTADOS REAIS DA APLICAÇÃO ==========
  const [marcacaoModoLivre, setMarcacaoModoLivre] = useState<Marcacao>(
    recursos.reduce((acc, r) => ({ ...acc, [r.nome]: 0 }), {})
  );
  const [modoLivre, setModoLivre] = useState(false);

  // REFs para valores atualizados
  const marcacaoModoLivreRef = useRef<Marcacao>(marcacaoModoLivre);
  const modoLivreRef = useRef(modoLivre);

  // ========== ESTADOS DA ÁRVORE ==========
  const [arvore, setArvore] = useState<NoArvore | null>(null);
  const [expandindoArvore, setExpandindoArvore] = useState(false);
  const [mostrarArvore, setMostrarArvore] = useState(false);
  const [nosArvore, setNosArvore] = useState<NoArvore[]>([]);
  const [numeroExpansoes, setNumeroExpansoes] = useState<number>(0);

  // ========== USEFFECT OTIMIZADOS ==========

  useEffect(() => {
    marcacaoModoLivreRef.current = marcacaoModoLivre;
  }, [marcacaoModoLivre]);

  useEffect(() => {
    modoLivreRef.current = modoLivre;
  }, [modoLivre]);

  useEffect(() => {
    if (!initializedRef.current) {
      initPetriNet();
    } else {
      atualizarVisualizacao();
    }
  }, [marcacaoModoLivre, recursos, playableCards, modoLivre]);

  // ==================== FUNÇÕES OTIMIZADAS ====================

  const getMarcacaoAtual = () => {
    return modoLivre ? marcacaoModoLivre : recursosParaMarcacao(recursos);
  };

  // CORREÇÃO: handleNodeClick agora é usado
  const handleNodeClick = (nodeLabel: string, event: React.MouseEvent) => {
    if (!modoLivreRef.current) return;

    setMarcacaoModoLivre((prevMarcacao) => {
      const novaMarcacao = { ...prevMarcacao };
      const valorAtual = novaMarcacao[nodeLabel];

      if (event.type === "contextmenu" || event.button === 2) {
        if (valorAtual === OMEGA) {
          novaMarcacao[nodeLabel] = OMEGA;
        } else {
          const currentValue = (valorAtual as number) || 0;
          novaMarcacao[nodeLabel] = Math.max(0, currentValue - 1);
        }
      } else {
        if (valorAtual === OMEGA) {
          novaMarcacao[nodeLabel] = OMEGA;
        } else {
          novaMarcacao[nodeLabel] = ((valorAtual as number) || 0) + 1;
        }
      }

      return novaMarcacao;
    });
  };

  // CORREÇÃO: testarDisparoTransicao agora é usado
  const testarDisparoTransicao = (transicaoId: string) => {
    if (!graphRef.current) return;

    const currentMarcacao = { ...marcacaoModoLivreRef.current };

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

    if (modoLivreRef.current) {
      setMarcacaoModoLivre(novaMarcacao);
    }
  };

  const atualizarVisualizacao = () => {
    if (!svgRef.current || !initializedRef.current) return;

    const currentMarcacao = getMarcacaoAtual();
    const svg = d3.select(svgRef.current);

    svg.selectAll(".token-count").text(function () {
      const parentData: any = d3.select((this as any).parentNode).datum();
      return parentData?.type === "place"
        ? String(currentMarcacao[parentData.label] ?? 0)
        : "0";
    });

    svg.selectAll(".transition-node").attr("fill", function () {
      const nodeData: any = d3.select((this as any).parentNode).datum();
      const isHabilitada =
        graphRef.current &&
        isTransicaoHabilitada(
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

  const handleModoLivreChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
  };

  const resetModoLivre = () => {
    setMarcacaoModoLivre(
      recursos.reduce((acc, r) => ({ ...acc, [r.nome]: 0 }), {})
    );
  };

  // CORREÇÃO: initPetriNet agora usa todas as funções necessárias
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

    // CORREÇÃO: BARALHO_INICIAL e BARALHO_OFERTA_INICIAL agora são usados
    const allCards = [...BARALHO_INICIAL, ...BARALHO_OFERTA_INICIAL];

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

    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;

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

    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    const g = svg.append("g");

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoomBehavior);

    // CORREÇÃO: simulationRef agora é usado
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

    // CORREÇÃO: handleNodeClick e testarDisparoTransicao agora são usados
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
          .on("click", (event) => handleNodeClick(d.label, event))
          .on("contextmenu", (event) => {
            event.preventDefault();
            handleNodeClick(d.label, event);
          });

        nodeGroup
          .append("text")
          .attr("class", "token-count")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-weight", "bold")
          .style("cursor", modoLivre ? "pointer" : "default")
          .text(getMarcacaoAtual()[d.label] || 0)
          .on("click", (event) => handleNodeClick(d.label, event))
          .on("contextmenu", (event) => {
            event.preventDefault();
            handleNodeClick(d.label, event);
          });

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

    g.append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 10)
      .attr("fill", (d: any) => d.color)
      .text((d: any) => d.weight);

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

    // CORREÇÃO: getGraphBounds agora é usado
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
      initializedRef.current = true;
    }, 500);
  };

  const gerarArvoreAlcancabilidade = () => {
    // Validação do número de expansões
    if (numeroExpansoes < 0 || numeroExpansoes > 10) {
      console.warn("Número de expansões deve estar entre 0 e 10");
      setNumeroExpansoes(Math.max(0, Math.min(10, numeroExpansoes)));
      return;
    }

    if (!graphRef.current) return;

    setExpandindoArvore(true);
    setMostrarArvore(true);

    setTimeout(() => {
      try {
        const marcacaoInicial = getMarcacaoAtual();

        const raiz: NoArvore = {
          id: "n0",
          marcacao: marcacaoInicial,
          children: [],
          expandido: false,
          nivel: 0,
        };

        // USAR A NOVA FUNÇÃO com o numeroExpansoes atual do estado
        const arvoreCompleta = expandirArvoreComSimulacao(
          raiz,
          graphRef.current!,
          playableCards,
          numeroExpansoes // Usar o valor atual do estado
        );

        // Atualizar estado com todos os nós
        const todosNos: NoArvore[] = [];
        const coletarNos = (no: NoArvore) => {
          todosNos.push(no);
          no.children.forEach(coletarNos);
        };
        coletarNos(arvoreCompleta);

        setNosArvore(todosNos);
        setArvore(arvoreCompleta);
        renderArvore(arvoreCompleta);

      } catch (error) {
        console.error("Erro ao gerar árvore:", error);
      } finally {
        setExpandindoArvore(false);
      }
    }, 100);
  };

  const formatarMarcacao = (marcacao: Marcacao): string => {
    return Object.entries(marcacao)
      .map(([recurso, quantidade]) => `${recurso}:${quantidade}`)
      .join(", ");
  };

  const obterTransicaoParaNo = (no: NoArvore): string => {
    if (!no.paiId || !arvore) return "Estado Inicial";

    const encontrarPai = (
      noAtual: NoArvore,
      idProcurado: string
    ): NoArvore | null => {
      if (noAtual.id === idProcurado) return noAtual;

      for (const filho of noAtual.children) {
        const resultado = encontrarPai(filho, idProcurado);
        if (resultado) return resultado;
      }

      return null;
    };

    const pai = encontrarPai(arvore, no.paiId);
    if (pai) {
      for (const filho of pai.children) {
        if (filho.id === no.id) {
          return filho.transicaoDisparada || "Transição desconhecida";
        }
      }
    }

    return "Transição desconhecida";
  };

  const centralizarNo = (nodeId: string) => {
    if (!mostrarArvore || !arvore) return;

    const treeContainer = document.getElementById("arvore-container");
    if (!treeContainer) return;

    const svg = d3.select(treeContainer).select("svg");
    if (svg.empty()) return;

    const g = svg.select("g");

    g.selectAll("circle").attr("stroke-width", 2).attr("stroke", "#fff");

    const node = g.selectAll(".node").filter((d: any) => d.id === nodeId);

    if (node.empty()) return;

    const nodeData = node.datum() as { x?: number; y?: number };
    if (!nodeData.x || !nodeData.y) return;

    const width = treeContainer.clientWidth;
    const height = treeContainer.clientHeight;

    const transform = d3.zoomIdentity
      .translate(width / 2 - nodeData.x, height / 2 - nodeData.y)
      .scale(1);

    g.transition().duration(750).attr("transform", transform.toString());

    node.select("circle").attr("stroke-width", 4).attr("stroke", "#61ff22ff");

    treeContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const renderArvore = (arvore: NoArvore) => {
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

    const g = svg.append("g");

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    const todosNos: NoArvore[] = [];
    const coletarNos = (no: NoArvore) => {
      todosNos.push(no);
      no.children.forEach(coletarNos);
    };
    coletarNos(arvore);

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

    const nodesData = todosNos.map((no) => ({
      id: no.id,
      marcacao: no.marcacao,
      ciclico: no.ciclico,
      terminal: no.terminal,
      isInitial: no.id === "n0",
      simulacao: no.simulacao,
      omega: no.omega,
      type: "state",
      size: 25,
      label: no.id.replace("n", "M").replace("s", "S"),
      x: undefined,
      y: undefined,
      fx: undefined,
      fy: undefined,
    }));

    const linksData = links.map((link) => ({
      source: link.source,
      target: link.target,
      label: link.label,
      color: "#999",
    }));

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

    const link = g
      .append("g")
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2);

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

    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(linksData)
      .enter()
      .append("text")
      .attr("font-size", 12)
      .attr("fill", "#ffffffff")
      .text((d: any) => d.label);

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

    node
      .append("circle")
      .attr("r", (d: any) => d.size)
      .attr("fill", (d: any) => {
        // Lógica de cores melhorada
        if (d.isInitial) return CORES_NOS.inicial; // Azul - Estado inicial
        if (d.simulacao) {
          // Nós de simulação
          if (d.terminal) return CORES_NOS.terminal; // Marrom - Terminal da simulação
          if (d.ciclico) return CORES_NOS.ciclico;   // Laranja - Cíclico na simulação
          return CORES_NOS.simulacaoIntermediario;   // Roxo escuro - Intermediário da simulação
        } else {
          // Nós reais da árvore principal
          if (d.omega) return CORES_NOS.omega;       // Vermelho - Nó com omega
          if (d.terminal) return CORES_NOS.terminal; // Marrom - Terminal real
          if (d.ciclico) return CORES_NOS.ciclico;   // Laranja - Cíclico real
          return d.nivel === 1 ? CORES_NOS.real : CORES_NOS.realIntermediario; // Verde ou verde escuro
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text((d: any) => d.label);

    node.append("title").text((d: any) => {
      const marcacaoStr = Object.entries(d.marcacao)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const tipo = d.isInitial
        ? " (Estado Inicial)"
        : d.simulacao
        ? " (Simulação)"
        : d.omega
        ? " (Omega)"
        : d.ciclico
        ? " (Cíclico)"
        : d.terminal
        ? " (Terminal)"
        : " (Intermediário)";
      return `Marcação${tipo}:\n${marcacaoStr}`;
    });

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

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .style("font-size", "12px")
      .text("Use scroll para zoom | Arraste para mover nós");

    setTimeout(() => {
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

      const padding = 50;
      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;

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
    }, 1000);
  };

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
          overflow: "hidden",
        }}
      >
        <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(54, 54, 54, 0.95)",
            padding: "12px 20px",
            borderBottom: "2px solid #4CAF50",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            backdropFilter: "blur(10px)",
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                minWidth: "120px",
              }}
            >
              Rede de Petri
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={modoLivre}
                  onChange={handleModoLivreChange}
                  color="primary"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#4CAF50",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#4CAF50",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ color: "#fff", fontWeight: "500" }}>
                    Modo Livre
                  </Typography>
                  {modoLivre && (
                    <Box
                      sx={{
                        ml: 1,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#4CAF50",
                        animation: "pulse 1s infinite",
                      }}
                    />
                  )}
                </Box>
              }
            />

            {modoLivre && (
              <Button
                onClick={resetModoLivre}
                variant="outlined"
                size="small"
                sx={{
                  color: "#fff",
                  borderColor: "#f44336",
                  "&:hover": {
                    borderColor: "#ff6659",
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                  },
                  fontSize: "12px",
                  padding: "4px 12px",
                  minWidth: "auto",
                }}
              >
                Resetar
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                minWidth: "80px",
              }}
            >
              <strong>Modo:</strong> {modoLivre ? "Livre" : "Normal"}
            </Typography>

            <Box sx={{ width: 200 }}>
              <Typography 
                id="expansoes-slider" 
                gutterBottom 
                sx={{ 
                  color: '#fff', 
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
                Expansões: {numeroExpansoes}
              </Typography>
              <Slider
                value={numeroExpansoes}
                onChange={(_, newValue) => setNumeroExpansoes(newValue as number)}
                aria-labelledby="expansoes-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={10}
                sx={{
                  color: '#2196F3',
                  '& .MuiSlider-track': {
                    backgroundColor: '#2196F3',
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#2196F3',
                  },
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#2196F3',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: '#fff',
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={gerarArvoreAlcancabilidade}
              disabled={expandindoArvore || numeroExpansoes < 0 || numeroExpansoes > 10}
              sx={{
                backgroundColor: "#2196F3",
                "&:hover": {
                  backgroundColor: "#1976D2",
                },
                "&:disabled": {
                  backgroundColor: "#666",
                },
                fontSize: "12px",
                padding: "6px 16px",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
              }}
            >
              {expandindoArvore ? "Expandindo..." : "Gerar Árvore"}
            </Button>
          </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <h3>Árvore de Alcançabilidade</h3>
              {numeroExpansoes > 0 && (
                <Chip 
                  label={`+${numeroExpansoes} expansões simuladas`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            {expandindoArvore && (
              <Typography variant="body2" color="primary">
                Expandindo árvore...
              </Typography>
            )}
          </Box>

          <Box id="arvore-container" sx={{ width: "100%", height: "550px" }} />
        </Paper>
      )}

      {mostrarArvore && nosArvore.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: "#363636",
            color: "#fff",
            maxHeight: "400px",
            overflow: "auto",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#fff", borderBottom: "2px solid #4CAF50", pb: 1 }}
          >
            Estados da Árvore de Alcançabilidade
            {numeroExpansoes > 0 && (
              <Chip 
                label={`Simulação: +${numeroExpansoes} expansões`}
                color="secondary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>

          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "60px", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Marcação
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "120px", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Transição
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "100px", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "60px", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Nível
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "80px", backgroundColor: "#2196F3", color: "#fff", fontSize: "0.875rem" }}>
                  Ação
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nosArvore.map((no) => (
                <TableRow
                  key={no.id}
                  sx={{
                    backgroundColor:
                      no.id === "n0"
                        ? "rgba(33, 150, 243, 0.1)" // Azul - Inicial
                        : no.simulacao
                        ? no.terminal
                          ? "rgba(121, 85, 72, 0.1)" // Marrom - Terminal simulação
                          : no.ciclico
                          ? "rgba(255, 152, 0, 0.1)" // Laranja - Cíclico simulação
                          : "rgba(123, 31, 162, 0.1)" // Roxo escuro - Intermediário simulação
                        : no.omega
                        ? "rgba(244, 67, 54, 0.1)" // Vermelho - Omega
                        : no.ciclico
                        ? "rgba(255, 152, 0, 0.1)" // Laranja - Cíclico real
                        : no.terminal
                        ? "rgba(121, 85, 72, 0.1)" // Marrom - Terminal real
                        : no.nivel === 1
                        ? "rgba(76, 175, 80, 0.1)" // Verde - Primeiro nível
                        : "rgba(56, 142, 60, 0.1)", // Verde escuro - Intermediário real
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                    color: "#fff",
                  }}
                >
                  <TableCell sx={{ fontWeight: "bold", color: "#fff", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    {no.id.replace("n", "M").replace("s", "S")}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#fff" }}>
                      {formatarMarcacao(no.marcacao)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    {obterTransicaoParaNo(no)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    {no.id === "n0"
                      ? "Inicial"
                      : no.simulacao
                      ? no.terminal
                        ? "Terminal (Simulação)"
                        : no.ciclico
                        ? "Cíclico (Simulação)"
                        : "Intermediário (Simulação)"
                      : no.omega
                      ? "Omega"
                      : no.ciclico
                      ? "Cíclico"
                      : no.terminal
                      ? "Terminal"
                      : no.nivel === 1
                      ? "Intermediário"
                      : "Intermediário Avançado"}
                  </TableCell>
                  <TableCell sx={{ color: "#fff", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    {no.nivel}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => centralizarNo(no.id)}
                      sx={{
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                        minWidth: "auto",
                        color: "#2196F3",
                        borderColor: "#2196F3",
                        "&:hover": {
                          backgroundColor: "rgba(33, 150, 243, 0.1)",
                          borderColor: "#64b5f6",
                        },
                      }}
                    >
                      Centralizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.inicial, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Estado Inicial</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.real, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Intermediário Real</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.realIntermediario, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Intermediário Avançado</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.omega, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Omega</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.ciclico, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Cíclico</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.terminal, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Terminal</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.simulacao, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Simulação</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: CORES_NOS.simulacaoIntermediario, mr: 1, border: "1px solid #fff" }} />
              <Typography variant="body2" sx={{ color: "#fff" }}>Simulação Intermediária</Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ResourcePetriNetComArvore;