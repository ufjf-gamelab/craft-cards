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
  Collapse,
  Alert,
  LinearProgress,
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
  simulacao?: boolean;
  omega?: boolean;
  depth?: number;
};

// CONSTANTES DE LIMITE PARA PERFORMANCE
const MAX_DEPTH = 3;
const MAX_EXPANSIONS = 50;
const MAX_CHILDREN_PER_NODE = 3;
const MAX_PATHS_TO_FIND = 10;

const CORES_NOS = {
  inicial: "#2196F3",
  real: "#4CAF50",
  realIntermediario: "#388E3C",
  omega: "#F44336",
  ciclico: "#FF9800",
  terminal: "#795548",
  simulacao: "#9C27B0",
  simulacaoIntermediario: "#7B1FA2",
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

// ==================== FUNÇÕES OTIMIZADAS PARA ÁRVORE ====================
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

const isTransicaoHabilitada = (
  transicaoId: string,
  marcacao: Marcacao,
  playableCards: Array<{ id: string }>,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
  modoLivre: boolean = false
): boolean => {
  try {
    if (!graph.hasNode(transicaoId)) return false;

    const cartaId = transicaoId.replace("transition_", "");

    if (!modoLivre) {
      const cartaJogavel = playableCards.some((card) => card.id === cartaId);
      if (!cartaJogavel) return false;
    }

    const arcosEntrada = graph.inEdges(transicaoId) || [];

    for (const arcoId of arcosEntrada) {
      const arcoAttr = graph.getEdgeAttributes(arcoId);
      const lugarId = graph.source(arcoId);
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
    return false;
  }
};

const dispararTransicao = (
  transicaoId: string,
  marcacao: Marcacao,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>
): Marcacao => {
  if (!graph.hasNode(transicaoId)) return marcacao;

  const novaMarcacao = { ...marcacao };

  try {
    const arcosEntrada = graph.inEdges(transicaoId) || [];
    for (const arcoId of arcosEntrada) {
      const arcoAttr = graph.getEdgeAttributes(arcoId);
      const lugarId = graph.source(arcoId);
      if (!graph.hasNode(lugarId)) continue;
      const recursoNome = graph.getNodeAttribute(lugarId, "label");
      const peso = arcoAttr.weight || 0;

      if (novaMarcacao[recursoNome] !== OMEGA) {
        const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
        novaMarcacao[recursoNome] = Math.max(0, quantidadeAtual - peso);
      }
    }

    const arcosSaida = graph.outEdges(transicaoId) || [];
    for (const arcoId of arcosSaida) {
      const arcoAttr = graph.getEdgeAttributes(arcoId);
      const lugarId = graph.target(arcoId);
      if (!graph.hasNode(lugarId)) continue;
      const recursoNome = graph.getNodeAttribute(lugarId, "label");
      const peso = arcoAttr.weight || 0;

      if (novaMarcacao[recursoNome] !== OMEGA) {
        const quantidadeAtual = (novaMarcacao[recursoNome] as number) || 0;
        novaMarcacao[recursoNome] = quantidadeAtual + peso;
      }
    }
  } catch (error) {}

  return novaMarcacao;
};

const encontrarCaminhosBFS = (
  start: string,
  end: string,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
  maxDepth: number = 3
): string[][] => {
  if (!graph.hasNode(start) || !graph.hasNode(end)) {
    return [];
  }

  const paths: string[][] = [];
  const visited = new Set<string>();
  const queue: { node: string; path: string[]; depth: number }[] = [
    { node: start, path: [], depth: 0 },
  ];

  while (queue.length > 0 && paths.length < MAX_PATHS_TO_FIND) {
    const { node, path, depth } = queue.shift()!;

    if (depth > maxDepth) continue;

    if (node === end) {
      paths.push([...path, node]);
      continue;
    }

    const neighbors = graph.outNeighbors(node).slice(0, 3);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && !path.includes(neighbor)) {
        visited.add(neighbor);
        queue.push({
          node: neighbor,
          path: [...path, node],
          depth: depth + 1,
        });
      }
    }
  }

  return paths;
};

const expandirArvoreComLimites = (
  raiz: NoArvore,
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes>,
  playableCards: Array<{ id: string }>,
  numeroExpansoes: number
): NoArvore => {
  const contadorNos = { count: 0 };
  const contadorSimulacao = { count: 0 };

  const expandirNormalmente = (
    no: NoArvore,
    caminhoAncestrais: NoArvore[] = [],
    depth: number = 0
  ): NoArvore => {
    if (
      no.terminal ||
      no.ciclico ||
      depth >= MAX_DEPTH ||
      contadorNos.count >= MAX_EXPANSIONS
    ) {
      no.terminal = true;
      return no;
    }

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
      )
      .slice(0, MAX_CHILDREN_PER_NODE);

    if (transicoesHabilitadas.length === 0) {
      no.terminal = true;
      return no;
    }

    for (const transicaoId of transicoesHabilitadas) {
      const novaMarcacao = dispararTransicao(transicaoId, no.marcacao, graph);

      let precisaOmega = false;
      for (const ancestral of novoCaminho) {
        if (marcaçãoDomina(novaMarcacao, ancestral.marcacao)) {
          precisaOmega = true;
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
        depth: depth + 1,
        omega: precisaOmega,
        simulacao: false,
      };

      no.children.push(novoNo);

      if (!precisaOmega) {
        expandirNormalmente(novoNo, novoCaminho, depth + 1);
      } else {
        novoNo.terminal = numeroExpansoes === 0;
      }
    }

    no.expandido = true;
    return no;
  };

  let arvoreExpandida = expandirNormalmente(raiz);

  if (numeroExpansoes > 0) {
    const nosOmega: NoArvore[] = [];

    const coletarNosOmega = (no: NoArvore) => {
      if (no.omega && !no.terminal && !no.simulacao) {
        nosOmega.push(no);
      }
      no.children.forEach(coletarNosOmega);
    };
    coletarNosOmega(arvoreExpandida);

    const expandirOmegaRecursivo = (
      no: NoArvore,
      expansoesRestantes: number,
      profundidade: number = 0
    ): void => {
      if (
        expansoesRestantes <= 0 ||
        profundidade > 50 ||
        contadorNos.count > 200
      ) {
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
        )
        .slice(0, MAX_CHILDREN_PER_NODE);

      if (transicoesHabilitadas.length === 0) {
        no.terminal = true;
        return;
      }

      for (const transicaoId of transicoesHabilitadas) {
        const novaMarcacao = { ...no.marcacao };

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
          depth: profundidade + 1,
          simulacao: true,
          omega: false,
        };

        no.children.push(novoNo);

        expandirOmegaRecursivo(
          novoNo,
          expansoesRestantes - 1,
          profundidade + 1
        );
      }

      no.expandido = true;
    };

    nosOmega.forEach((noOmega) => {
      expandirOmegaRecursivo(noOmega, numeroExpansoes);
    });
  }

  return arvoreExpandida;
};

const ResourcePetriNet: React.FC<ResourcePetriNetProps> = ({
  recursos,
  playableCards,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<any>(null);
  const graphRef = useRef<MultiDirectedGraph<
    NodeAttributes,
    LinkAttributes
  > | null>(null);
  const nodeGroupsRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const [marcacaoModoLivre, setMarcacaoModoLivre] = useState<Marcacao>(
    recursos.reduce((acc, r) => ({ ...acc, [r.nome]: 0 }), {})
  );
  const [modoLivre, setModoLivre] = useState(false);

  const marcacaoModoLivreRef = useRef<Marcacao>(marcacaoModoLivre);
  const modoLivreRef = useRef(modoLivre);

  const [arvore, setArvore] = useState<NoArvore | null>(null);
  const [expandindoArvore, setExpandindoArvore] = useState(false);
  const [mostrarArvore, setMostrarArvore] = useState(false);
  const [nosArvore, setNosArvore] = useState<NoArvore[]>([]);
  const [numeroExpansoes, setNumeroExpansoes] = useState<number>(0);
  const [caminhosEncontrados, setCaminhosEncontrados] = useState<string[][]>(
    []
  );
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);

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

  const getMarcacaoAtual = () => {
    return modoLivre ? marcacaoModoLivre : recursosParaMarcacao(recursos);
  };

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

  const testarDisparoTransicao = (transicaoId: string) => {
    if (!graphRef.current) return;

    const currentMarcacao = { ...marcacaoModoLivreRef.current };

    if (!graphRef.current.hasNode(transicaoId)) {
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

    nodeGroupsRef.current.each(function (this: SVGGElement, d: NodeAttributes) {
      const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);

      if (d.type === "place") {
        nodeGroup
          .append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", "var(--text-primary)")
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
          .attr("fill", "var(--text-primary)")
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
          .attr("fill", "var(--text-primary)")
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
          .attr("stroke", "var(--text-primary)")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("click", () => testarDisparoTransicao(d.id));

        nodeGroup
          .append("text")
          .attr("dy", 25)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--text-primary)")
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

  function isValidGraph(graph: any): graph is MultiDirectedGraph {
    return graph && typeof graph.filterNodes === 'function' && typeof graph.forEachNode === 'function';
  }

  const gerarArvoreAlcancabilidade = () => {
    if (numeroExpansoes > 5) {
      setShowPerformanceWarning(true);
    }

    if (numeroExpansoes < 0 || numeroExpansoes > 10) {
      console.warn("Número de expansões deve estar entre 0 e 10");
      setNumeroExpansoes(Math.max(0, Math.min(10, numeroExpansoes)));
      return;
    }

    if (!graphRef.current || !isValidGraph(graphRef.current)) {
      console.error('Grafo inválido ou não inicializado');
      setExpandindoArvore(false);
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
          depth: 0,
        };

        const arvoreCompleta = expandirArvoreComLimites(
          raiz,
          graphRef.current!,
          playableCards,
          numeroExpansoes
        );

        const todosNos: NoArvore[] = [];
        const coletarNos = (no: NoArvore) => {
          todosNos.push(no);
          no.children.forEach(coletarNos);
        };
        coletarNos(arvoreCompleta);

        setNosArvore(todosNos);
        setArvore(arvoreCompleta);
        renderArvore(arvoreCompleta);

        if (graphRef.current) {
          const resourceNodes = graphRef.current
            .nodes()
            .filter(
              (node) =>
                graphRef.current!.getNodeAttribute(node, "type") === "place"
            )
            .map((node) => graphRef.current!.getNodeAttribute(node, "label"));

          if (resourceNodes.length >= 2) {
            const start = resourceNodes[0];
            const end = resourceNodes[1];
            const caminhos = encontrarCaminhosBFS(
              start,
              end,
              graphRef.current,
              3
            );
            setCaminhosEncontrados(caminhos);
          }
        }
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

    g.selectAll("circle").attr("stroke-width", 2).attr("stroke", "var(--text-primary)");

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

    node.select("circle").attr("stroke-width", 4).attr("stroke", "var(--accent-color)");

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
      .attr("fill", "var(--text-primary)")
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
        if (d.isInitial) return CORES_NOS.inicial;
        if (d.simulacao) {
          if (d.terminal) return CORES_NOS.terminal;
          if (d.ciclico) return CORES_NOS.ciclico;
          return CORES_NOS.simulacaoIntermediario;
        } else {
          if (d.omega) return CORES_NOS.omega;
          if (d.terminal) return CORES_NOS.terminal;
          if (d.ciclico) return CORES_NOS.ciclico;
          return d.nivel === 1 ? CORES_NOS.real : CORES_NOS.realIntermediario;
        }
      })
      .attr("stroke", "var(--text-primary)")
      .attr("stroke-width", 2);

    node
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-primary)")
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
      .attr("fill", "var(--text-primary)")
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
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "10px",
          boxShadow: "0 2px 10px var(--shadow-color)",
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
            backgroundColor: "rgba(var(--bg-primary-rgb), 0.95)",
            padding: "12px 20px",
            borderBottom: "2px solid var(--accent-color)",
            boxShadow: "0 4px 12px var(--shadow-color)",
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
                color: "var(--text-primary)",
                fontWeight: "bold",
                textShadow: "0 2px 4px var(--shadow-color)",
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
                  <Typography sx={{ color: "var(--text-primary)", fontWeight: "500" }}>
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
                  color: "var(--text-primary)",
                  borderColor: "var(--error-color)",
                  "&:hover": {
                    borderColor: "var(--error-color)",
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
                color: "var(--text-primary)",
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
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                Expansões: {numeroExpansoes}
              </Typography>
              <Slider
                value={numeroExpansoes}
                onChange={(_, newValue) =>
                  setNumeroExpansoes(newValue as number)
                }
                aria-labelledby="expansoes-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={10}
                sx={{
                  color: "#2196F3",
                  "& .MuiSlider-track": {
                    backgroundColor: "#2196F3",
                  },
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#2196F3",
                  },
                  "& .MuiSlider-valueLabel": {
                    backgroundColor: "#2196F3",
                  },
                  "& .MuiSlider-mark": {
                    backgroundColor: "var(--text-primary)",
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={gerarArvoreAlcancabilidade}
              disabled={
                expandindoArvore || numeroExpansoes < 0 || numeroExpansoes > 10
              }
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

      <Collapse in={showPerformanceWarning}>
        <Alert
          severity="warning"
          onClose={() => setShowPerformanceWarning(false)}
          sx={{
            mb: 2,
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            "& .MuiAlert-icon": { color: "var(--warning-color)" }
          }}
        >
          <Typography variant="body2">
            <strong>Atenção:</strong> Expansões acima de 5 podem impactar a
            performance. Limites aplicados: Profundidade máxima = {MAX_DEPTH},
            Expansões máximas = {MAX_EXPANSIONS}
          </Typography>
        </Alert>
      </Collapse>

      {expandindoArvore && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
          <Typography
            variant="caption"
            sx={{ color: "var(--text-primary)", textAlign: "center", display: "block", mt: 1 }}
          >
            Expandindo árvore de alcançabilidade com limites otimizados...
          </Typography>
        </Box>
      )}

      {caminhosEncontrados.length > 0 && (
        <Paper sx={{ p: 2, backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>
          <Typography variant="h6" gutterBottom>
            Caminhos Encontrados (BFS)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "var(--text-secondary)" }}>
            {caminhosEncontrados.length} caminhos encontrados usando algoritmo
            BFS otimizado:
          </Typography>
          {caminhosEncontrados.slice(0, 3).map((caminho, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: "var(--bg-elevated)",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontFamily="monospace">
                {caminho.join(" → ")}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {mostrarArvore && (
        <Paper
          sx={{
            height: "600px",
            minWidth: "800px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "10px",
            boxShadow: "0 2px 10px var(--shadow-color)",
          }}
        >
          <Box sx={{ p: 2, color: "var(--text-primary)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <h3>Árvore de Alcançabilidade</h3>
              <Chip
                label={`Limites: Profundidade=${MAX_DEPTH}, Expansões=${MAX_EXPANSIONS}`}
                color="info"
                size="small"
                variant="outlined"
              />
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
                Expandindo árvore com algoritmos otimizados...
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
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            maxHeight: "400px",
            overflow: "auto",
            borderRadius: "10px",
            boxShadow: "0 2px 10px var(--shadow-color)",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "var(--text-primary)", borderBottom: "2px solid var(--accent-color)", pb: 1 }}
          >
            Estados da Árvore de Alcançabilidade
            <Chip
              label={`${nosArvore.length} nós gerados`}
              color="info"
              size="small"
              sx={{ ml: 2 }}
            />
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
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "60px",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Estado
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Marcação
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "120px",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Transição
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "100px",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Tipo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "60px",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Nível
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "80px",
                    backgroundColor: "#2196F3",
                    color: "#fff",
                    fontSize: "0.875rem",
                  }}
                >
                  Ação
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nosArvore.slice(0, 100).map((no) => (
                <TableRow
                  key={no.id}
                  sx={{
                    backgroundColor:
                      no.id === "n0"
                        ? "rgba(33, 150, 243, 0.1)"
                        : no.simulacao
                        ? no.terminal
                          ? "rgba(121, 85, 72, 0.1)"
                          : no.ciclico
                          ? "rgba(255, 152, 0, 0.1)"
                          : "rgba(123, 31, 162, 0.1)"
                        : no.omega
                        ? "rgba(244, 67, 54, 0.1)"
                        : no.ciclico
                        ? "rgba(255, 152, 0, 0.1)"
                        : no.terminal
                        ? "rgba(121, 85, 72, 0.1)"
                        : no.nivel === 1
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(56, 142, 60, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {no.id.replace("n", "M").replace("s", "S")}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatarMarcacao(no.marcacao)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {obterTransicaoParaNo(no)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
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
                  <TableCell
                    sx={{
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {no.nivel}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
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
              {nosArvore.length > 100 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ textAlign: "center", color: "var(--text-secondary)", py: 2 }}
                  >
                    <Typography variant="body2">
                      ... e mais {nosArvore.length - 100} nós (exibição limitada
                      para performance)
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.inicial,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Estado Inicial
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.real,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Intermediário Real
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.realIntermediario,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Intermediário Avançado
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.omega,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Omega
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.ciclico,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Cíclico
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.terminal,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Terminal
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.simulacao,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Simulação
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: CORES_NOS.simulacaoIntermediario,
                  mr: 1,
                  border: "1px solid var(--text-primary)",
                }}
              />
              <Typography variant="body2" sx={{ color: "var(--text-primary)" }}>
                Simulação Intermediária
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ResourcePetriNet;