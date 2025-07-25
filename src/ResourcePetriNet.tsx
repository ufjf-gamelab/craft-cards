import React, { useRef } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import { Paper, Box } from "@mui/material";
import { BARALHO_INICIAL, BARALHO_OFERTA_INICIAL } from "./data/cartas.ts";
import {
  NodeAttributes,
  LinkAttributes,
  renderArrowMarkers,
  renderPlaceNode,
  renderLinks,
  renderLinkLabels,
  renderNodes,
  getGraphBounds
} from "./PetriNetFunctions";

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

const ResourcePetriNet: React.FC<ResourcePetriNetProps> = ({
  recursos,
  playableCards,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const updateTokens = () => {
    if (!initializedRef.current || !svgRef.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

    svg.selectAll<SVGTextElement, NodeAttributes>(".token-count")
      .text((d) => {
        const resource = recursos.find((r) => r.nome === d.label);
        return (resource?.quantidade || 0).toString();
      });

    svg.selectAll<SVGCircleElement, unknown>(".token").remove();

    svg.selectAll<SVGGElement, NodeAttributes>("g")
      .filter((d): d is NodeAttributes => d?.type === "place")
      .each(function(d) {
        const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);
        const tokens = recursos.find((r) => r.nome === d.label)?.quantidade || 0;
        renderPlaceNode(nodeGroup, d, tokens);
      });
  };

  const updateTransitionColors = () => {
    if (!initializedRef.current || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll(".transition-node").attr("fill", (d: any) => {
      if (d.type !== "transition") return d.color;
      const cardId = d.id.replace("transition_", "");
      return playableCards.some((card) => card.id === cardId)
        ? NODE_COLORS.activeTransition
        : NODE_COLORS.transition;
    });
  };

  if (!initializedRef.current && svgRef.current && containerRef.current) {
    initializedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const graph = new MultiDirectedGraph<NodeAttributes, LinkAttributes>();
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
        tokens: recursos.find((r) => r.nome === nome)?.quantidade || 0,
        size: 15,
        color: NODE_COLORS.place,
      });
    });

    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;

      carta.custo.forEach((custo) => {
        const placeId = `place_${custo.nome}`;
        graph.addDirectedEdge(placeId, transitionId, {
          source: placeId,
          target: transitionId,
          weight: custo.quantidade,
          color: LINK_COLORS.input,
        });
      });

      carta.ganho.forEach((ganho) => {
        const placeId = `place_${ganho.nome}`;
        graph.addDirectedEdge(transitionId, placeId, {
          source: transitionId,
          target: placeId,
          weight: ganho.quantidade,
          color: LINK_COLORS.output,
        });
      });
    });

    const nodes = graph.mapNodes((node) => graph.getNodeAttributes(node));
    const links = graph.mapEdges((edge) => graph.getEdgeAttributes(edge));

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoomBehavior);

    const g = svg.append("g");

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

    renderArrowMarkers(svg);
    const linkElements = renderLinks(g, links);
    const linkLabels = renderLinkLabels(g, links);
    const nodeElements = renderNodes(g, nodes, playableCards, simulation);

    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      nodeElements.attr("transform", (d) => `translate(${d.x},${d.y})`);

      linkLabels
        .attr("x", (d) => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", (d) => ((d.source as any).y + (d.target as any).y) / 2);
    });

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
    updateTokens();
  }

  updateTokens();
  updateTransitionColors();

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

export default ResourcePetriNet;