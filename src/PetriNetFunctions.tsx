import * as d3 from "d3";
import { NODE_COLORS, LINK_COLORS } from "./ResourcePetriNet";

export type NodeAttributes = {
  id: string;
  label: string;
  type: "place" | "transition";
  tokens?: number;
  size: number;
  color: string;
  x?: number;
  y?: number;
};

export type LinkAttributes = {
  source: string;
  target: string;
  weight: number;
  color: string;
};

export const renderArrowMarkers = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
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
};

export const renderPlaceNode = (
  nodeGroup: d3.Selection<SVGGElement, NodeAttributes, null, undefined>,
  d: NodeAttributes,
  tokenCount: number
) => {
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
    .text(tokenCount);

  const maxVisibleTokens = 5;
  const tokenRadius = 3;

  if (tokenCount > 0) {
    const tokensToShow = Math.min(tokenCount, maxVisibleTokens);
    const angleStep = (2 * Math.PI) / tokensToShow;

    for (let i = 0; i < tokensToShow; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * (d.size * 0.5);
      const y = Math.sin(angle) * (d.size * 0.5);

      nodeGroup
        .append("circle")
        .attr("class", "token")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", tokenRadius)
        .attr("fill", "#fff");
    }

    if (tokenCount > maxVisibleTokens) {
      nodeGroup
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", tokenRadius * 1.5)
        .attr("fill", "#fff");
    }
  }

  nodeGroup
    .append("text")
    .attr("dy", d.size + 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "10px")
    .text(d.label);
};

export const renderTransitionNode = (
  nodeGroup: d3.Selection<SVGGElement, NodeAttributes, null, undefined>,
  d: NodeAttributes,
  isActive: boolean
) => {
  nodeGroup
    .append("rect")
    .attr("class", "transition-node")
    .attr("width", d.size * 0.5)
    .attr("height", d.size * 4)
    .attr("x", -d.size * 0.25)
    .attr("y", -d.size * 2)
    .attr("rx", 2)
    .attr("fill", isActive ? NODE_COLORS.activeTransition : d.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  nodeGroup
    .append("text")
    .attr("dy", d.size + 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "10px")
    .text(d.label);
};

export const renderLinks = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkAttributes[]
) => {
  return g
    .append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 2)
    .attr("marker-end", (d) => `url(#arrowhead-${d.color.replace("#", "")}`);
};

export const renderLinkLabels = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkAttributes[]
) => {
  return g
    .append("g")
    .selectAll("text")
    .data(links)
    .enter()
    .append("text")
    .attr("font-size", 10)
    .attr("fill", (d) => d.color)
    .text((d) => d.weight);
};

export const renderNodes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: NodeAttributes[],
  playableCards: Array<{ id: string }>,
  simulation: d3.Simulation<NodeAttributes, LinkAttributes>
) => {
  const nodeGroups = g
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

  nodeGroups.each(function (d) {
    const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);
    
    if (d.type === "place") {
      const tokenCount = d.tokens || 0;
      renderPlaceNode(nodeGroup, d, tokenCount);
    } else {
      const cardId = d.id.replace("transition_", "");
      const isActive = playableCards.some((card) => card.id === cardId);
      renderTransitionNode(nodeGroup, d, isActive);
    }
  });

  return nodeGroups;
};

export const getGraphBounds = (
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