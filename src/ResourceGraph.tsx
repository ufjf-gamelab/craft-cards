import React, { useContext, useRef, useState } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import { GameReducerContext } from "./Game.ts";
import { Paper, Typography, Box } from "@mui/material";
import LegendaGrafo from "./LegendaGrafo.tsx";
import { BARALHO_INICIAL, BARALHO_OFERTA_INICIAL } from "./data/cartas.ts";

type ResourceGraphProps = {
  onGraphCreated?: (graph: MultiDirectedGraph) => void;
}

interface NodeAttributes {
  id: string;
  label: string;
  type: "resource" | "card";
  quantity?: number;
  size: number;
  color: string;
  x?: number;
  y?: number;
}

interface LinkAttributes {
  source: string;
  target: string;
  label: string;
  color: string;
}

export const NODE_COLORS = {
  resource: "#4CAF50",
  card: "#2196F3",
};

export const LINK_COLORS = {
  gain: "#4CAF50",
  cost: "#F44336",
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ onGraphCreated }) => {
  const game = useContext(GameReducerContext);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphInitialized, setGraphInitialized] = useState(false);

  if (!game) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography>Carregando análise de recursos...</Typography>
      </Paper>
    );
  }

  // Função para inicializar o gráfico
  const initializeGraph = () => {
    if (!svgRef.current || !containerRef.current || graphInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Limpa qualquer conteúdo anterior
    d3.select(svgRef.current).selectAll("*").remove();

    // Criação do grafo
    const graph = new MultiDirectedGraph<NodeAttributes, LinkAttributes>();
    const allCards = [...BARALHO_INICIAL, ...BARALHO_OFERTA_INICIAL];

    // Adiciona nós de CARTAS e RECURSOS
    allCards.forEach((carta) => {
      const cardId = `card_${carta.id}`;
      graph.addNode(cardId, {
        id: cardId,
        label: carta.titulo,
        type: "card",
        size: 8,
        color: NODE_COLORS.card,
      });

      carta.ganho.forEach((ganho) => {
        if (!graph.hasNode(ganho.nome)) {
          graph.addNode(ganho.nome, {
            id: ganho.nome,
            label: ganho.nome,
            type: "resource",
            quantity: ganho.quantidade,
            size: Math.log(ganho.quantidade + 1) * 5 + 10,
            color: NODE_COLORS.resource,
          });
        }
      });

      carta.custo.forEach((custo) => {
        if (!graph.hasNode(custo.nome)) {
          graph.addNode(custo.nome, {
            id: custo.nome,
            label: custo.nome,
            type: "resource",
            quantity: custo.quantidade,
            size: Math.log(custo.quantidade + 1) * 5 + 10,
            color: NODE_COLORS.resource,
          });
        }
      });
    });

    // Adiciona arcos de GANHO e CUSTO
    allCards.forEach((carta) => {
      const cardId = `card_${carta.id}`;
      carta.ganho.forEach((ganho) => {
        if (graph.hasNode(ganho.nome)) {
          graph.addDirectedEdge(cardId, ganho.nome, {
            source: cardId,
            target: ganho.nome,
            label: `+${ganho.quantidade}`,
            color: LINK_COLORS.gain,
          });
        }
      });

      carta.custo.forEach((custo) => {
        if (graph.hasNode(custo.nome)) {
          graph.addDirectedEdge(custo.nome, cardId, {
            source: custo.nome,
            target: cardId,
            label: `-${custo.quantidade}`,
            color: LINK_COLORS.cost,
          });
        }
      });
    });

    // Dados para D3
    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    // Configuração do SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoomBehavior);

    const g = svg.append("g");

    // Cria a simulação
    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05)
      .velocityDecay(0.4);

    // Configuração dos marcadores de seta
    const defs = svg.append("defs");
    Object.values(LINK_COLORS).forEach((color) => {
      defs.append("marker")
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

    // Desenha as linhas de conexão
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => `url(#arrowhead-${d.color.replace("#", "")}`);

    // Desenha os nós
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3.drag<SVGGElement, NodeAttributes>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node.append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d) => d.type === "resource" ? `${d.label} (${d.quantity})` : d.label)
      .attr("dy", (d) => d.size + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .style("font-size", "10px");

    // Rótulos das conexões
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 10)
      .attr("fill", (d) => d.color)
      .text((d) => d.label);

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

    // Ajusta o zoom para caber no container
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

    setTimeout(adjustZoom, 1500);
    setGraphInitialized(true);

    // Call the callback if provided
    if (onGraphCreated) {
      onGraphCreated(graph);
    }
    
  };

  // Chama a inicialização do gráfico quando o container estiver montado
  React.useLayoutEffect(() => {
    initializeGraph();
  }, []);

  return (
    <div className="resource-graph-container">
      <Paper sx={{ height: "600px", minWidth: "800px", position: "relative" }}>
        <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </Box>
        <LegendaGrafo />
      </Paper>
    </div>
  );
};

// Função auxiliar para calcular o Bounding Box do Grafo
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

  // Add padding
  const padding = 50;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
  };
};

export default ResourceGraph;
