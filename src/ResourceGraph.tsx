import React, { useContext, useRef, useState, useEffect } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import { GameReducerContext } from "./Game.ts";
import { Paper, Typography, Box } from "@mui/material";
import LegendaGrafo from "./LegendaGrafo.tsx";
import { CartaType } from "./data/cartas";

type ResourceGraphProps = {
  onGraphCreated?: (graph: MultiDirectedGraph) => void;
  allCards?: CartaType[];
};

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
  active: "#FFC107",
};

export const LINK_COLORS = {
  gain: "#4CAF50",
  cost: "#F44336",
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ onGraphCreated, allCards }) => {
  const game = useContext(GameReducerContext);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphInitialized, setGraphInitialized] = useState(false);

  if (!game) {
    return (
      <Paper sx={{ 
        p: 2, 
        textAlign: "center",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-primary)"
      }}>
        <Typography sx={{ color: "var(--text-primary)" }}>Carregando análise de recursos...</Typography>
      </Paper>
    );
  }

  const initializeGraph = () => {
    if (!svgRef.current || !containerRef.current || graphInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const graph = new MultiDirectedGraph<NodeAttributes, LinkAttributes>();
    
    // Usa as cartas fornecidas via prop ou array vazio (ou você pode manter fallback)
    const cardsToUse = allCards ?? [];

    const resourceNodes = new Map<string, { nome: string, quantidade: number }>();

    cardsToUse.forEach((carta) => {
      carta.ganho.forEach((ganho) => {
        if (!resourceNodes.has(ganho.nome)) {
          resourceNodes.set(ganho.nome, ganho);
        }
      });

      carta.custo.forEach((custo) => {
        if (!resourceNodes.has(custo.nome)) {
          resourceNodes.set(custo.nome, custo);
        }
      });
    });

    resourceNodes.forEach((recurso) => {
      graph.addNode(recurso.nome, {
        id: recurso.nome,
        label: recurso.nome,
        type: "resource",
        quantity: recurso.quantidade,
        size: Math.log(recurso.quantidade + 1) * 5 + 10,
        color: NODE_COLORS.resource,
      });
    });

    cardsToUse.forEach((carta) => {
      const cardId = `card_${carta.id}`;
      graph.addNode(cardId, {
        id: cardId,
        label: carta.titulo,
        type: "card",
        size: 8,
        color: NODE_COLORS.card,
      });

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

    // Restante do código (forças, zoom, drag, etc.) permanece idêntico ao original
    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "var(--bg-secondary)");

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoomBehavior);

    const g = svg.append("g");

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05)
      .velocityDecay(0.4);

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

    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => `url(#arrowhead-${d.color.replace("#", "")}`);

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
      .attr("stroke", "var(--text-primary)")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px var(--shadow-color))");

    node.append("text")
      .text((d) => d.type === "resource" ? `${d.label} (${d.quantity})` : d.label)
      .attr("dy", (d) => d.size + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-primary)")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", 10)
      .attr("fill", (d) => d.color)
      .attr("font-weight", "bold")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)")
      .text((d) => d.label);

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

    function dragstarted(this: SVGGElement, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(this).select("circle")
        .attr("stroke-width", 4)
        .attr("stroke", "var(--accent-color)");
    }

    function dragged(this: SVGGElement, event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(this: SVGGElement, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(this).select("circle")
        .attr("stroke-width", 2)
        .attr("stroke", "var(--text-primary)");
    }

    svg.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "var(--text-primary)")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Use scroll para zoom | Arraste para mover nós");

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
    setGraphInitialized(true);

    if (onGraphCreated) {
      onGraphCreated(graph);
    }
  };

  useEffect(() => {
    initializeGraph();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (svgRef.current && containerRef.current) {
          d3.select(svgRef.current).selectAll("*").remove();
          setGraphInitialized(false);
          initializeGraph();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [allCards]); // <-- adicionar dependência para reconstruir o grafo se as cartas mudarem

  return (
    <div className="resource-graph-container">
      <Paper sx={{ 
        height: "600px", 
        minWidth: "800px", 
        position: "relative",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "10px",
        boxShadow: "0 2px 10px var(--shadow-color)",
        overflow: "hidden"
      }}>
        <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </Box>
        <LegendaGrafo />
      </Paper>
    </div>
  );
};

const getGraphBounds = (
  nodes: NodeAttributes[],
  width: number,
  height: number
) => {
  // (mesma implementação original)
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

export default ResourceGraph;