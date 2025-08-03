import React, { useRef, useState } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import { Paper, Box } from "@mui/material";
import { BARALHO_INICIAL, BARALHO_OFERTA_INICIAL } from "./data/cartas.ts";

type NodeAttributes = {
  id: string;
  label: string;
  type: "place" | "transition";
  tokens?: number;
  size: number;
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
  place: "#4CAF50", // Verde para lugares (recursos)
  transition: "#2196F3", // Azul para transições (cartas)
  activeTransition: "#FFC107", //Laranja para transições que podem ser ativas
};

export const LINK_COLORS = {
  input: "#F44336", // Vermelho para arcos de entrada (custos)
  output: "#4CAF50", // Verde para arcos de saída (ganhos)
};

const ResourcePetriNet: React.FC<ResourcePetriNetProps> = ({
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

  // Função de inicialização
  const initPetriNet = () => {
    if (!svgRef.current || !containerRef.current || petriNetInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3.select(svgRef.current);

    // Limpa o SVG e configura dimensões
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Criação do grafo estático
    const graph = new MultiDirectedGraph<NodeAttributes, LinkAttributes>();
    graphRef.current = graph;

    const allCards = [...BARALHO_INICIAL, ...BARALHO_OFERTA_INICIAL];

    // Adiciona nós de transição (cartas)
    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;
      graph.addNode(transitionId, {
        id: transitionId,
        label: carta.titulo,
        type: "transition",
        size: 10,
        color: playableCards.some((card) => card.id === carta.id)
          ? NODE_COLORS.activeTransition
          : NODE_COLORS.transition,
      });
    });

    // 2. Adiciona todos os lugares (recursos)
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
        tokens: recursos.find((r) => r.nome === nome)?.quantidade || 0, //adiciona tokens
        size: 15,
        color: NODE_COLORS.place,
      });
    });

    // 3. Adiciona todos os arcos
    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;

      // Arcos de entrada (custos)
      carta.custo.forEach((custo) => {
        const placeId = `place_${custo.nome}`;
        graph.addDirectedEdge(placeId, transitionId, {
          source: placeId,
          target: transitionId,
          weight: custo.quantidade, //tokens consumidos
          color: LINK_COLORS.input,
        });
      });

      // Arcos de saída (ganhos)
      carta.ganho.forEach((ganho) => {
        const placeId = `place_${ganho.nome}`;
        graph.addDirectedEdge(transitionId, placeId, {
          source: transitionId,
          target: placeId,
          weight: ganho.quantidade, //tokens produzidos
          color: LINK_COLORS.output,
        });
      });
    });

    // Converte para formato D3
    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    // Configuração do zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoomBehavior);

    const g = svg.append("g");

    // Cria a simulação de força
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

    // Marcadores de seta
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

    // Links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => `url(#arrowhead-${d.color.replace("#", "")}`);

    // Nós
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag<SVGGElement, NodeAttributes>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Renderização dos nós
    node.each(function (this: SVGGElement, d: NodeAttributes) {
      const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);

      if (d.type === "place") {
        nodeGroup
          .append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        nodeGroup
          .append("text")
          .attr("class", "token-count")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-weight", "bold")
          .text(d.tokens || 0);

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
          .attr("stroke-width", 2);

        nodeGroup
          .append("text")
          .attr("dy", 25)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-size", "10px")
          .text(d.label);
      }
    });

    // Rótulos dos arcos
    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 10)
      .attr("fill", (d) => d.color)
      .text((d) => d.weight);

    // Atualização da simulação
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      linkLabels
        .attr("x", (d) => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", (d) => ((d.source as any).y + (d.target as any).y) / 2);
    });

    // Funções de drag
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

    // Ajuste inicial do zoom
    const adjustZoom = () => {
      const bounds = getGraphBounds(nodes, width, height);
      if (!bounds) return;

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
    };

    setTimeout(adjustZoom, 500);
    setPetriNetInitialized(true);
  };

  // Função para atualizar os visuais
  const updatePetriNet = () => {
    if (!petriNetInitialized || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Atualiza tokens
    svg.selectAll(".token-count").text((d: any) => {
      if (d.type !== "place") {
        return "0"; // Retorna como string para garantir compatibilidade
      }
      const resource = recursos.find((r) => r.nome === d.label);
      return resource ? String(resource.quantidade) : "0";
    });

    // Atualiza cores das transições
    svg.selectAll(".transition-node").attr("fill", (d: any) => {
      if (d.type !== "transition") return d.color;
      const cardId = d.id.replace("transition_", "");
      return playableCards.some((card) => card.id === cardId)
        ? NODE_COLORS.activeTransition
        : NODE_COLORS.transition;
    });
  };

  // Inicializa a PetriNet quando o componente é montado
  React.useLayoutEffect(() => {
    initPetriNet();
  }, []);

  // Atualiza a PetriNet quando os recursos ou cartas jogáveis mudam
  React.useLayoutEffect(() => {
    updatePetriNet();
  }, [recursos, playableCards]);

  return (
    <Paper
      sx={{
        height: "600px",
        minWidth: "800px",
        position: "relative",
        backgroundColor: "#363636ff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.837)",
      }}
    >
      <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </Box>
    </Paper>
  );
};

// Função auxiliar para calcular os limites do grafo
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

export default ResourcePetriNet;
