import React from "react";
import { MultiDirectedGraph } from "graphology";
import { density } from "graphology-metrics/graph/density";
import diameter from 'graphology-metrics/graph/diameter';
import eccentricity from 'graphology-metrics/node/eccentricity';
import { weightedDegree } from 'graphology-metrics/node/weighted-degree';
import { connectedComponents } from 'graphology-components';
import simpleSize from 'graphology-metrics/graph/simple-size';
import { Paper, Typography } from "@mui/material";
import { LINK_COLORS } from "./ResourceGraph";

type GraphMetricsProps = {
  graph?: MultiDirectedGraph;
}

type ResourceDegreeInfo = {
  name: string;
  degree: number;
  type: string;
  quantity?: number;
}

type GraphMetricsData = {
  basic: {
    order: number;
    size: number;
    density: string;
    isDirected: boolean;
    isMultiGraph: boolean;
  };
  centrality: {
    averageDegree: string;
    degreeDistribution: Record<number, number>;
    weightedDegreeDistribution: Record<number, number>;
  };
  connectivity: {
    diameter: number;
    averageEccentricity: string;
    isConnected: boolean;
    stronglyConnectedComponents: number;
  };
  nodeTypeStats: {
    resource: { count: number; totalQuantity: number };
    card: { count: number };
  };
  edgeTypeStats: {
    gain: { count: number; totalQuantity: number };
    cost: { count: number; totalQuantity: number };
  };
  resourceDegrees: ResourceDegreeInfo[];
}

export const calculateMetrics = (graph: MultiDirectedGraph): GraphMetricsData | null => {
  if (graph.order === 0) return null;

  try {
    return {
      basic: {
        order: graph.order,
        size: simpleSize(graph),
        density: density(graph).toFixed(4),
        isDirected: true,
        isMultiGraph: true,
      },
      centrality: {
        averageDegree: calculateAverageDegree(graph),
        degreeDistribution: calculateDegreeDistribution(graph),
        weightedDegreeDistribution: calculateWeightedDegreeDistribution(graph),
      },
      connectivity: {
        diameter: diameter(graph),
        averageEccentricity: calculateAverageEccentricity(graph),
        isConnected: connectedComponents(graph).length === 1,
        stronglyConnectedComponents: connectedComponents(graph).length,
      },
      nodeTypeStats: calculateNodeTypeStats(graph),
      edgeTypeStats: calculateEdgeTypeStats(graph),
      resourceDegrees: calculateResourceDegrees(graph),
    };
  } catch (error) {
    console.error("Error calculating graph metrics:", error);
    return null;
  }
};

const calculateAverageDegree = (graph: MultiDirectedGraph): string => {
  const degrees = graph.mapNodes((node) => graph.degree(node));
  const sum = degrees.reduce((acc, val) => acc + val, 0);
  return (sum / degrees.length).toFixed(2);
};

const calculateDegreeDistribution = (graph: MultiDirectedGraph): Record<number, number> => {
  const distribution: Record<number, number> = {};
  graph.forEachNode((node) => {
    const degree = graph.degree(node);
    distribution[degree] = (distribution[degree] || 0) + 1;
  });
  return distribution;
};

const calculateWeightedDegreeDistribution = (graph: MultiDirectedGraph): Record<number, number> => {
  const distribution: Record<number, number> = {};
  graph.forEachNode((node) => {
    const wDegree = weightedDegree(graph, node);
    distribution[wDegree] = (distribution[wDegree] || 0) + 1;
  });
  return distribution;
};

const calculateAverageEccentricity = (graph: MultiDirectedGraph): string => {
  const eccs = graph.mapNodes((node) => eccentricity(graph, node));
  const sum = eccs.reduce((acc, val) => acc + val, 0);
  return (sum / eccs.length).toFixed(2);
};

const calculateNodeTypeStats = (graph: MultiDirectedGraph) => {
  const stats = {
    resource: { count: 0, totalQuantity: 0 },
    card: { count: 0 },
  };

  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    if (attrs.type === "resource") {
      stats.resource.count++;
      stats.resource.totalQuantity += attrs.quantity || 0;
    } else if (attrs.type === "card") {
      stats.card.count++;
    }
  });

  return stats;
};

const calculateResourceDegrees = (graph: MultiDirectedGraph): ResourceDegreeInfo[] => {
  const resources: ResourceDegreeInfo[] = [];
  
  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    if (attrs.type === "resource") {
      resources.push({
        name: node,
        degree: graph.degree(node),
        type: attrs.type,
        quantity: attrs.quantity || 0
      });
    }
  });
  
  // Ordena por grau (maior primeiro)
  resources.sort((a, b) => b.degree - a.degree);
  
  return resources;
};

const calculateEdgeTypeStats = (graph: MultiDirectedGraph) => {
  const stats = {
    gain: { count: 0, totalQuantity: 0 },
    cost: { count: 0, totalQuantity: 0 },
  };

  graph.forEachEdge((edge) => {
    const attrs = graph.getEdgeAttributes(edge);
    if (attrs.color === LINK_COLORS.gain) {
      stats.gain.count++;
      const quantity = parseInt(attrs.label.replace("+", "")) || 0;
      stats.gain.totalQuantity += quantity;
    } else if (attrs.color === LINK_COLORS.cost) {
      stats.cost.count++;
      const quantity = parseInt(attrs.label.replace("-", "")) || 0;
      stats.cost.totalQuantity += quantity;
    }
  });

  return stats;
};

const GraphMetrics: React.FC<GraphMetricsProps> = ({ graph }) => {
  const currentGraph = graph || new MultiDirectedGraph();
  const metrics = calculateMetrics(currentGraph);

  if (!metrics) {
    return (
      <Paper style={{ padding: 16, textAlign: "center" }}>
        <Typography>Carregando métricas do grafo...</Typography>
      </Paper>
    );
  }

  return (
    <div className="graph-metrics-container">
      <Paper style={{ padding: 16, height: "100%", overflow: "auto" }}>
        <Typography variant="h6" style={{ marginBottom: 16 }}>
          Métricas do Grafo de Recursos
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {/* Métricas Básicas */}
          <div style={{ flex: "1 1 300px" }}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Informações Básicas
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Typography>
                  <strong>Número de Nós (Ordem):</strong> {metrics.basic.order}
                </Typography>
                <Typography>
                  <strong>Número de Arestas (Tamanho):</strong> {metrics.basic.size}
                </Typography>
                <Typography>
                  <strong>Densidade:</strong> {metrics.basic.density}
                </Typography>
                <Typography>
                  <strong>Direcionado:</strong> Sim
                </Typography>
                <Typography>
                  <strong>Multigrafo:</strong> Sim
                </Typography>
              </div>
            </Paper>
          </div>
          
          {/* Centralidade */}
          <div style={{ flex: "1 1 300px" }}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Centralidade e Conectividade
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Typography>
                  <strong>Grau Médio:</strong> {metrics.centrality.averageDegree}
                </Typography>
                <Typography>
                  <strong>Diâmetro:</strong> {metrics.connectivity.diameter}
                </Typography>
                <Typography>
                  <strong>Excentricidade Média:</strong> {metrics.connectivity.averageEccentricity}
                </Typography>
                <Typography>
                  <strong>Grafo Conexo:</strong> {metrics.connectivity.isConnected ? "Sim" : "Não"}
                </Typography>
                <Typography>
                  <strong>Componentes Conexos:</strong>{" "}
                  {metrics.connectivity.stronglyConnectedComponents}
                </Typography>
              </div>
            </Paper>
          </div>
          
          {/* Estatísticas de Nós */}
          <div style={{ flex: "1 1 300px" }}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Estatísticas de Nós
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Typography>
                  <strong>Recursos:</strong> {metrics.nodeTypeStats.resource.count} nós
                </Typography>
                <Typography>
                  <strong>Total de Recursos:</strong> {metrics.nodeTypeStats.resource.totalQuantity}
                </Typography>
                <Typography>
                  <strong>Cartas:</strong> {metrics.nodeTypeStats.card.count} nós
                </Typography>
                <div style={{ height: 1, backgroundColor: "#e0e0e0", margin: "8px 0" }} />
                <Typography variant="subtitle2">Distribuição de Grau</Typography>
                {Object.entries(metrics.centrality.degreeDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([degree, count]) => (
                    <Typography key={String(degree)}>
                      Grau {String(degree)}: {String(count)} nós
                    </Typography>
                  ))}
              </div>
            </Paper>
          </div>
          
          {/* Estatísticas de Arestas */}
          <div style={{ flex: "1 1 300px" }}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Estatísticas de Arestas
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Typography>
                  <strong>Ganhos:</strong> {metrics.edgeTypeStats.gain.count} arestas
                </Typography>
                <Typography>
                  <strong>Total de Ganhos:</strong> +{metrics.edgeTypeStats.gain.totalQuantity}
                </Typography>
                <Typography>
                  <strong>Gastos:</strong> {metrics.edgeTypeStats.cost.count} arestas
                </Typography>
                <Typography>
                  <strong>Total de Gastos:</strong> -{metrics.edgeTypeStats.cost.totalQuantity}
                </Typography>
              </div>
            </Paper>
          </div>
          
          {/* Recursos por Grau de Conexão */}
          <div style={{ flex: "1 1 400px" }}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Recursos Mais Conectados (Comuns)
              </Typography>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
                {metrics.resourceDegrees.slice(0, 5).map((resource, index) => (
                  <div key={resource.name} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    padding: 4,
                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white'
                  }}>
                    <Typography variant="body2">
                      {index + 1}. {resource.name}
                    </Typography>
                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                      {resource.degree} conexões
                    </Typography>
                  </div>
                ))}
              </div>

              <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
                Recursos Pouco Conectados (Raros)
              </Typography>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {metrics.resourceDegrees.slice(-5).reverse().map((resource, index) => (
                  <div key={resource.name} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    padding: 4,
                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white'
                  }}>
                    <Typography variant="body2">
                      {metrics.resourceDegrees.length - index}. {resource.name}
                    </Typography>
                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                      {resource.degree} conexão{resource.degree !== 1 ? 'es' : ''}
                    </Typography>
                  </div>
                ))}
              </div>
            </Paper>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default GraphMetrics;