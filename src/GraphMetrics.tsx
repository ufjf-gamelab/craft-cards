import React, { useState } from "react";
import { MultiDirectedGraph } from "graphology";
import { density } from "graphology-metrics/graph/density";
import diameter from 'graphology-metrics/graph/diameter';
import eccentricity from 'graphology-metrics/node/eccentricity';
import { weightedDegree } from 'graphology-metrics/node/weighted-degree';
import { connectedComponents } from 'graphology-components';
import simpleSize from 'graphology-metrics/graph/simple-size';
import { Paper, Typography, Box, Tabs, Tab, List, ListItemButton, ListItemIcon, ListItemText, ListItem, Collapse, IconButton, Tooltip, Chip, Divider } from "@mui/material";

export const NODE_COLORS = {
  resource: "#4CAF50",    // Verde
  card: "#2196F3",        // Azul 
  active: "#FFC107",      // Amarelo
};

export const LINK_COLORS = {
  gain: "#4CAF50",        // Verde
  cost: "#F44336",        // Vermelho 
};

type GraphMetricsProps = {
  graph?: MultiDirectedGraph;
}

type ResourceDegreeInfo = {
  name: string;
  degree: number;
  inDegree: number;
  outDegree: number;
  type: string;
  quantity?: number;
  production?: number;
  consumption?: number;
}

type ProductionConsumptionStats = {
  producedResources: ResourceDegreeInfo[];
  consumedResources: ResourceDegreeInfo[];
  topProducers: ResourceDegreeInfo[];
  topConsumers: ResourceDegreeInfo[];
  totalProduction: number;
  totalConsumption: number;
}

type PathAnalysis = {
  allPaths: Record<string, Record<string, string[][]>>;
  shortestPaths: Record<string, Record<string, string[]>>;
  mostDemandedResource: ResourceDegreeInfo | null;
  hasCycles: boolean;
  cycleExamples: string[][];
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
  productionConsumption: ProductionConsumptionStats;
  pathAnalysis: PathAnalysis;
}

type Problem = {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  message: string;
  resource?: string;
  details?: string;
  fix?: string;
}

const ExpandIcon = ({ expanded }: { expanded: boolean }) => (
  <span style={{ 
    display: 'inline-block',
    transform: expanded ? 'rotate(180deg)' : 'none', 
    transition: 'transform 0.3s',
    fontSize: '1.2rem',
    color: '#fff'
  }}>
    ▼
  </span>
);

const MetricSection: React.FC<{
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, description, expanded, onToggle, children }) => (
  <Paper style={{ 
    marginBottom: 16,
    backgroundColor: '#424242',
    border: '1px solid #555'
  }}>
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      p={2}
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
      sx={{
        '&:hover': {
          backgroundColor: '#4a4a4a',
        }
      }}
    >
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Tooltip title={description} arrow>
          <span style={{ marginLeft: 8, fontSize: '0.9rem', color: '#FFC107' }}>ℹ️</span>
        </Tooltip>
      </Box>
      <IconButton size="small">
        <ExpandIcon expanded={expanded} />
      </IconButton>
    </Box>
    <Collapse in={expanded}>
      <Box p={2} pt={0}>
        {children}
      </Box>
    </Collapse>
  </Paper>
);

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}> = ({ label, value, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFC107', minWidth: '120px' }}>
      {label}:
    </Typography>
    {tooltip ? (
      <Tooltip title={tooltip} arrow>
        <Typography sx={{ color: 'white' }}>{value}</Typography>
      </Tooltip>
    ) : (
      <Typography sx={{ color: 'white' }}>{value}</Typography>
    )}
  </Box>
);

const ResourceChip: React.FC<{
  resource: ResourceDegreeInfo;
  type: 'production' | 'consumption';
}> = ({ resource, type }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 1,
    bgcolor: type === 'production' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
    borderRadius: 1,
    mb: 1,
    border: `1px solid ${type === 'production' ? '#4CAF50' : '#F44336'}`
  }}>
    <Typography variant="body2" sx={{ color: 'white' }}>{resource.name}</Typography>
    <Chip 
      label={type === 'production' ? `+${resource.production}` : `-${resource.consumption}`}
      size="small"
      sx={{ 
        bgcolor: type === 'production' ? '#4CAF50' : '#F44336',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.75rem'
      }}
    />
  </Box>
);

const ErrorIcon = () => <span style={{ color: '#F44336', fontWeight: 'bold' }}>✖</span>;
const WarningIcon = () => <span style={{ color: '#FF9800', fontWeight: 'bold' }}>⚠</span>;
const LightbulbIcon = () => <span style={{ color: '#2196F3', fontWeight: 'bold' }}>💡</span>;

const findAllPaths = (
  graph: MultiDirectedGraph,
  start: string,
  end: string,
  maxDepth = 10
): string[][] => {
  const paths: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[], depth: number) {
    if (depth > maxDepth) return;
    if (current === end) {
      paths.push([...path, current]);
      return;
    }

    visited.add(current);
    graph.forEachOutEdge(current, (edge) => {
      const neighbor = graph.target(edge);
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, current], depth + 1);
      }
    });
    visited.delete(current);
  }

  dfs(start, [], 0);
  return paths;
};

const findMostDemandedResource = (graph: MultiDirectedGraph): ResourceDegreeInfo | null => {
  let maxDemand = -1;
  let mostDemanded: ResourceDegreeInfo | null = null;

  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    if (attrs.type === "resource") {
      const outDegree = graph.outDegree(node);
      if (outDegree > maxDemand) {
        maxDemand = outDegree;
        mostDemanded = {
          name: node,
          degree: graph.degree(node),
          inDegree: graph.inDegree(node),
          outDegree,
          type: attrs.type,
          quantity: attrs.quantity || 0
        };
      }
    }
  });

  return mostDemanded;
};

const findCycles = (graph: MultiDirectedGraph): string[][] => {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(node: string) {
    visited.add(node);
    path.push(node);

    graph.forEachOutEdge(node, (edge) => {
      const neighbor = graph.target(edge);
      
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (path.includes(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    });

    path.pop();
  }

  graph.forEachNode((node) => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });

  return Array.from(new Set(cycles.map(cycle => JSON.stringify(cycle))))
    .map(str => JSON.parse(str))
    .slice(0, 3);
};

const findAllPathsBetweenResources = (
  graph: MultiDirectedGraph
): Record<string, Record<string, string[][]>> => {
  const resourceNodes = graph.filterNodes(node => 
    graph.getNodeAttributes(node).type === "resource"
  );
  
  const allPaths: Record<string, Record<string, string[][]>> = {};

  for (const start of resourceNodes) {
    allPaths[start] = {};
    
    for (const end of resourceNodes) {
      if (start !== end) {
        const paths = findAllPaths(graph, start, end);
        if (paths.length > 0) {
          allPaths[start][end] = paths;
        }
      }
    }
  }

  return allPaths;
};

const findShortestPaths = (
  allPaths: Record<string, Record<string, string[][]>>
): Record<string, Record<string, string[]>> => {
  const shortestPaths: Record<string, Record<string, string[]>> = {};

  for (const [start, ends] of Object.entries(allPaths)) {
    shortestPaths[start] = {};
    
    for (const [end, paths] of Object.entries(ends)) {
      if (paths.length > 0) {
        shortestPaths[start][end] = paths.reduce((shortest, current) => 
          current.length < shortest.length ? current : shortest
        );
      }
    }
  }

  return shortestPaths;
};

const calculateProductionConsumption = (graph: MultiDirectedGraph): ProductionConsumptionStats => {
  const resources: ResourceDegreeInfo[] = [];
  let totalProduction = 0;
  let totalConsumption = 0;

  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    if (attrs.type === "resource") {
      const inDegree = graph.inDegree(node);
      const outDegree = graph.outDegree(node);
      
      let production = 0;
      let consumption = 0;

      graph.forEachInEdge(node, (edge) => {
        const edgeAttrs = graph.getEdgeAttributes(edge);
        if (edgeAttrs.color === LINK_COLORS.gain) {
          const quantity = parseInt(edgeAttrs.label.replace("+", "")) || 0;
          production += quantity;
          totalProduction += quantity;
        }
      });

      graph.forEachOutEdge(node, (edge) => {
        const edgeAttrs = graph.getEdgeAttributes(edge);
        if (edgeAttrs.color === LINK_COLORS.cost) {
          const quantity = parseInt(edgeAttrs.label.replace("-", "")) || 0;
          consumption += quantity;
          totalConsumption += quantity;
        }
      });

      resources.push({
        name: node,
        degree: graph.degree(node),
        inDegree,
        outDegree,
        type: attrs.type,
        quantity: attrs.quantity || 0,
        production,
        consumption
      });
    }
  });

  const producedResources = resources.filter(r => (r.production ?? 0) > 0)
    .sort((a, b) => (b.production ?? 0) - (a.production ?? 0));
  
  const consumedResources = resources.filter(r => (r.consumption ?? 0) > 0)
    .sort((a, b) => (b.consumption ?? 0) - (a.consumption ?? 0));

  return {
    producedResources,
    consumedResources,
    topProducers: producedResources.slice(0, 5),
    topConsumers: consumedResources.slice(0, 5),
    totalProduction,
    totalConsumption
  };
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
        inDegree: graph.inDegree(node),
        outDegree: graph.outDegree(node),
        type: attrs.type,
        quantity: attrs.quantity || 0
      });
    }
  });
  
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

export const calculateMetrics = (graph: MultiDirectedGraph): GraphMetricsData | null => {
  if (graph.order === 0) return null;

  try {
    const allPaths = findAllPathsBetweenResources(graph);
    const shortestPaths = findShortestPaths(allPaths);
    const cycles = findCycles(graph);

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
      productionConsumption: calculateProductionConsumption(graph),
      pathAnalysis: {
        allPaths,
        shortestPaths,
        mostDemandedResource: findMostDemandedResource(graph),
        hasCycles: cycles.length > 0,
        cycleExamples: cycles
      }
    };
  } catch (error) {
    console.error("Error calculating graph metrics:", error);
    return null;
  }
};

const BalanceAnalysisPanel: React.FC<{ metrics: GraphMetricsData }> = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState<'problems' | 'warnings' | 'suggestions'>('problems');
  
  const generateProblems = (): Problem[] => {
    const problems: Problem[] = [];
    const coOccurrenceMap = new Map<string, number>();
    const patternMap = new Map<string, number>();

    // 1. Problemas críticos
    Object.entries(metrics.pathAnalysis.shortestPaths).forEach(([start, paths]) => {
      const allResources = Object.keys(metrics.pathAnalysis.allPaths);
      allResources.forEach(end => {
        if (start !== end && !paths[end]) {
          problems.push({
            id: `unreachable-${start}-${end}`,
            type: 'error',
            message: `Recurso "${end}" não pode ser alcançado a partir de "${start}"`,
            resource: end,
            details: `Não existe caminho de produção para obter ${end} a partir de ${start}`,
            fix: `Adicione uma carta que produza ${end} ou crie uma cadeia de produção intermediária`
          });
        }
      });
    });

    // 2. Warnings
    metrics.resourceDegrees.forEach(resource => {
      if (resource.outDegree === 0 && resource.inDegree > 0) {
        problems.push({
          id: `unused-${resource.name}`,
          type: 'warning',
          message: `Recurso "${resource.name}" é produzido mas não é consumido`,
          resource: resource.name,
          details: `Produzido ${resource.inDegree} vezes mas nunca consumido`,
          fix: `Adicione cartas que consumam ${resource.name} ou remova suas fontes de produção`
        });
      }
    });

    if (!metrics.connectivity.isConnected) {
      problems.push({
        id: 'disconnected-graph',
        type: 'warning',
        message: 'O grafo possui componentes desconexos',
        details: `Existem ${metrics.connectivity.stronglyConnectedComponents} subgrafos não conectados entre si`,
        fix: 'Considere adicionar cartas que conectem os diferentes subsistemas de recursos'
      });
    }

    if (metrics.pathAnalysis.mostDemandedResource) {
      const top = metrics.pathAnalysis.mostDemandedResource;
      problems.push({
        id: 'high-demand',
        type: 'warning',
        message: `Recurso "${top.name}" tem alta demanda (${top.outDegree} usos)`,
        resource: top.name,
        details: `É consumido por ${top.outDegree} cartas mas produzido apenas ${top.inDegree} vezes`,
        fix: `Balanceie adicionando mais fontes de "${top.name}" ou reduzindo suas dependências`
      });
    }

    if (metrics.pathAnalysis.hasCycles) {
      problems.push({
        id: 'cycles-detected',
        type: metrics.pathAnalysis.cycleExamples.length > 2 ? 'warning' : 'info',
        message: `${metrics.pathAnalysis.cycleExamples.length} ciclos de dependência detectados`,
        details: `Exemplo: ${metrics.pathAnalysis.cycleExamples[0].join(' → ')} → ${metrics.pathAnalysis.cycleExamples[0][0]}`,
        fix: 'Ciclos podem criar loops infinitos - verifique se são intencionais'
      });
    }

    // 3. Análise para sugestões
    // 3.1. Densidade do grafo
    if (parseFloat(metrics.basic.density) > 0.5) {
      problems.push({
        id: 'high-density',
        type: 'suggestion',
        message: 'Densidade do grafo muito alta (sistema complexo)',
        details: `Densidade atual: ${metrics.basic.density}`,
        fix: 'Considere simplificar as relações entre recursos ou dividir em subsistemas'
      });
    }

    // 3.2. Balanceamento econômico
    metrics.resourceDegrees.forEach(resource => {
      if (resource.inDegree > 0 && resource.outDegree > 0) {
        const ratio = resource.outDegree / resource.inDegree;
        if (ratio > 2) {
          problems.push({
            id: `high-demand-ratio-${resource.name}`,
            type: 'suggestion',
            message: `Recurso "${resource.name}" tem alta relação demanda/produção`,
            details: `É consumido ${resource.outDegree} vezes mas produzido apenas ${resource.inDegree} vezes (razão ${ratio.toFixed(1)})`,
            fix: `Considere adicionar mais fontes de "${resource.name}" ou reduzir suas dependências`
          });
        } else if (ratio < 0.5) {
          problems.push({
            id: `low-demand-ratio-${resource.name}`,
            type: 'suggestion',
            message: `Recurso "${resource.name}" tem baixa utilização`,
            details: `É produzido ${resource.inDegree} vezes mas consumido apenas ${resource.outDegree} vezes`,
            fix: `Considere adicionar mais usos para "${resource.name}" ou reduzir sua produção`
          });
        }
      }
    });

    // 3.3. Caminhos longos
    Object.entries(metrics.pathAnalysis.shortestPaths).forEach(([start, paths]) => {
      Object.entries(paths).forEach(([end, path]) => {
        if (path.length > 4) {
          problems.push({
            id: `long-path-${start}-${end}`,
            type: 'suggestion',
            message: `Caminho muito longo entre ${start} e ${end}`,
            details: `Requer ${path.length-1} passos: ${path.join(" → ")}`,
            fix: `Considere adicionar um atalho direto ou recurso intermediário`
          });
        }
      });
    });

    // 3.4. Padrões de co-ocorrência
    Object.values(metrics.pathAnalysis.shortestPaths).forEach(paths => {
      Object.values(paths).forEach(path => {
        // Mapeia pares de recursos consecutivos
        path.forEach((node, i) => {
          if (i < path.length-1) {
            const pair = `${node}→${path[i+1]}`;
            coOccurrenceMap.set(pair, (coOccurrenceMap.get(pair) || 0) + 1);
          }
        });

        // Mapeia padrões de 3 recursos
        for (let i = 0; i < path.length-2; i++) {
          const sequence = path.slice(i, i+3).join('→');
          patternMap.set(sequence, (patternMap.get(sequence) || 0) + 1);
        }
      });
    });

    // Sugere combinar recursos frequentemente pareados
    coOccurrenceMap.forEach((count, pair) => {
      if (count > 3) {
        const [resA, resB] = pair.split('→');
        problems.push({
          id: `co-occurrence-${pair}`,
          type: 'suggestion',
          message: `Recursos ${resA} e ${resB} são frequentemente usados juntos`,
          details: `Aparecem juntos em ${count} caminhos diferentes`,
          fix: `Considere criar um recurso composto "${resA}+${resB}" ou uma carta que os produza/consuma juntos`
        });
      }
    });

    // Sugere formalizar padrões recorrentes
    patternMap.forEach((count, sequence) => {
      if (count >= 3) {
        problems.push({
          id: `pattern-${sequence}`,
          type: 'suggestion',
          message: `Padrão recorrente detectado: ${sequence.replace(/→/g, ' → ')}`,
          details: `Aparece ${count} vezes em diferentes caminhos`,
          fix: `Considere criar uma mecânica ou carta que encapsule este padrão`
        });
      }
    });

    // 3.5. Recursos subutilizados
    metrics.resourceDegrees.forEach(resource => {
      if (resource.inDegree === 1 && resource.outDegree === 1) {
        problems.push({
          id: `underutilized-${resource.name}`,
          type: 'suggestion',
          message: `Recurso "${resource.name}" tem apenas uma fonte e um uso`,
          details: 'Pode ser um ponto desnecessário na cadeia de produção',
          fix: `Considere remover "${resource.name}" ou dar mais utilidades a ele`
        });
      }
    });

    // 3.6. Balanceamento produção/consumo global
    const globalRatio = metrics.productionConsumption.totalProduction / 
                       (metrics.productionConsumption.totalConsumption || 1);
    
    if (globalRatio > 1.5) {
      problems.push({
        id: 'global-production-excess',
        type: 'suggestion',
        message: 'Produção global muito maior que consumo',
        details: `Produção total: +${metrics.productionConsumption.totalProduction} | Consumo total: -${metrics.productionConsumption.totalConsumption}`,
        fix: 'Ajuste as quantidades para evitar acúmulo excessivo de recursos'
      });
    } else if (globalRatio < 0.67) {
      problems.push({
        id: 'global-consumption-excess',
        type: 'suggestion',
        message: 'Consumo global muito maior que produção',
        details: `Produção total: +${metrics.productionConsumption.totalProduction} | Consumo total: -${metrics.productionConsumption.totalConsumption}`,
        fix: 'Ajuste as quantidades para evitar falta de recursos'
      });
    }

    return problems;
  };

  const problems = generateProblems();
  const errors = problems.filter(p => p.type === 'error');
  const warnings = problems.filter(p => p.type === 'warning');
  const suggestions = problems.filter(p => p.type === 'suggestion' || p.type === 'info');

  return (
    <Paper style={{ 
      padding: 16, 
      height: '100%', 
      overflow: 'auto',
      backgroundColor: '#363636',
      color: 'white'
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
        Análise de Balanceamento
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: '#555', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#ccc',
              '&.Mui-selected': {
                color: '#2196F3',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196F3',
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon />
                <span style={{ marginLeft: 8 }}>Problemas ({errors.length})</span>
              </Box>
            } 
            value="problems" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon />
                <span style={{ marginLeft: 8 }}>Alertas ({warnings.length})</span>
              </Box>
            } 
            value="warnings" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LightbulbIcon />
                <span style={{ marginLeft: 8 }}>Sugestões ({suggestions.length})</span>
              </Box>
            } 
            value="suggestions" 
          />
        </Tabs>
      </Box>

      <Box sx={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
        {activeTab === 'problems' && (
          <List dense>
            {errors.map(problem => (
              <ListItem key={problem.id} sx={{ borderBottom: '1px solid #444' }}>
                <ListItemButton onClick={() => {}} sx={{ color: 'white' }}>
                  <ListItemIcon>
                    <ErrorIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={problem.message}
                    secondary={problem.details}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {errors.length === 0 && (
              <Typography color="#ccc" sx={{ p: 2 }}>
                Nenhum problema crítico encontrado
              </Typography>
            )}
          </List>
        )}

        {activeTab === 'warnings' && (
          <List dense>
            {warnings.map(problem => (
              <ListItem key={problem.id} sx={{ borderBottom: '1px solid #444' }}>
                <ListItemButton onClick={() => {}} sx={{ color: 'white' }}>
                  <ListItemIcon>
                    <WarningIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={problem.message}
                    secondary={problem.details}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {warnings.length === 0 && (
              <Typography color="#ccc" sx={{ p: 2 }}>
                Nenhum alerta encontrado
              </Typography>
            )}
          </List>
        )}

        {activeTab === 'suggestions' && (
          <List dense>
            {suggestions.map(problem => (
              <ListItem key={problem.id} sx={{ borderBottom: '1px solid #444' }}>
                <ListItemButton onClick={() => {}} sx={{ color: 'white' }}>
                  <ListItemIcon>
                    <LightbulbIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={problem.message}
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#ccc' }}>{problem.details}</Typography>
                        <Typography variant="caption" sx={{ color: '#2196F3' }}>
                          {problem.fix}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {suggestions.length === 0 && (
              <Typography color="#ccc" sx={{ p: 2 }}>
                Nenhuma sugestão disponível
              </Typography>
            )}
          </List>
        )}
      </Box>
    </Paper>
  );
};

const GraphMetrics: React.FC<GraphMetricsProps> = ({ graph }) => {
  const currentGraph = graph || new MultiDirectedGraph();
  const metrics = calculateMetrics(currentGraph);
  const [activeTab, setActiveTab] = useState<'metrics' | 'balance'>('metrics');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    centrality: true,
    connectivity: true,
    nodeStats: true,
    edgeStats: true,
    production: true,
    pathAnalysis: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!metrics) {
    return (
      <Paper style={{ 
        padding: 16, 
        textAlign: "center",
        backgroundColor: '#363636',
        color: 'white'
      }}>
        <Typography sx={{ color: 'white' }}>Carregando métricas do grafo...</Typography>
      </Paper>
    );
  }

  return (
    <div className="graph-metrics-container">
      <Paper style={{ 
        padding: 16, 
        height: "100%", 
        overflow: "auto",
        backgroundColor: '#363636'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Métricas do Grafo de Recursos
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              color: '#ccc',
              '&.Mui-selected': {
                color: '#2196F3',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196F3',
            },
          }}
        >
          <Tab label="Métricas" value="metrics" />
          <Tab label="Análise de Balanceamento" value="balance" />
        </Tabs>

        {activeTab === 'metrics' ? (
          <>
            <MetricSection
              title="Informações Básicas"
              description="Métricas fundamentais sobre a estrutura do grafo. Ajuda a entender a complexidade geral do sistema de recursos."
              expanded={expandedSections.basic}
              onToggle={() => toggleSection('basic')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                <MetricItem 
                  label="Nós" 
                  value={metrics.basic.order}
                  tooltip="Total de recursos e cartas no jogo"
                />
                <MetricItem 
                  label="Arestas" 
                  value={metrics.basic.size}
                  tooltip="Número total de relações entre cartas e recursos"
                />
                <MetricItem 
                  label="Densidade" 
                  value={metrics.basic.density}
                  tooltip="Proporção de conexões existentes vs possíveis. Valores altos indicam sistema complexo."
                />
                <MetricItem 
                  label="Direcionado" 
                  value="Sim"
                  tooltip="As relações têm direção definida (produção/consumo)"
                />
                <MetricItem 
                  label="Multigrafo" 
                  value="Sim"
                  tooltip="Permite múltiplas conexões entre os mesmos nós"
                />
              </Box>
            </MetricSection>

            <MetricSection
              title="Centralidade"
              description="Identifica os recursos mais importantes e conectados no sistema. Recursos centrais podem ser gargalos ou pontos estratégicos."
              expanded={expandedSections.centrality}
              onToggle={() => toggleSection('centrality')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                <MetricItem 
                  label="Grau Médio" 
                  value={metrics.centrality.averageDegree}
                  tooltip="Média de conexões por nó. Indica o nível médio de interconexão."
                />
                <MetricItem 
                  label="Diâmetro" 
                  value={metrics.connectivity.diameter}
                  tooltip="Maior distância entre dois nós. Mostra a maior cadeia de dependências."
                />
                <MetricItem 
                  label="Excentricidade Média" 
                  value={metrics.connectivity.averageEccentricity}
                  tooltip="Distância média entre os nós. Valores altos indicam caminhos longos entre recursos."
                />
              </Box>
            </MetricSection>

            <MetricSection
              title="Conectividade"
              description="Analisa como os recursos estão interligados. Componentes desconexos podem indicar mecânicas isoladas."
              expanded={expandedSections.connectivity}
              onToggle={() => toggleSection('connectivity')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                <MetricItem 
                  label="Conexo" 
                  value={metrics.connectivity.isConnected ? "Sim" : "Não"}
                  tooltip="Se todos os nós estão conectados direta ou indiretamente"
                />
                <MetricItem 
                  label="Componentes Conexos" 
                  value={metrics.connectivity.stronglyConnectedComponents}
                  tooltip="Número de subgrafos isolados. Idealmente deveria ser 1 para um sistema coeso."
                />
              </Box>
            </MetricSection>

            <MetricSection
              title="Estatísticas de Nós"
              description="Distribuição dos tipos de elementos no jogo. Ajuda a balancear quantidade de recursos vs cartas."
              expanded={expandedSections.nodeStats}
              onToggle={() => toggleSection('nodeStats')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                <MetricItem 
                  label="Recursos" 
                  value={`${metrics.nodeTypeStats.resource.count} nós`}
                  tooltip="Quantidade total de recursos diferentes no jogo"
                />
                <MetricItem 
                  label="Total de Recursos" 
                  value={metrics.nodeTypeStats.resource.totalQuantity}
                  tooltip="Soma de todas as quantidades de recursos disponíveis"
                />
                <MetricItem 
                  label="Cartas" 
                  value={`${metrics.nodeTypeStats.card.count} nós`}
                  tooltip="Quantidade total de cartas que interagem com os recursos"
                />
              </Box>
            </MetricSection>

            <MetricSection
              title="Estatísticas de Arestas"
              description="Balanço entre produção e consumo de recursos. Diferenças grandes podem indicar desbalanceamento."
              expanded={expandedSections.edgeStats}
              onToggle={() => toggleSection('edgeStats')}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                <MetricItem 
                  label="Ganhos" 
                  value={`${metrics.edgeTypeStats.gain.count} (+${metrics.edgeTypeStats.gain.totalQuantity})`}
                  tooltip="Número total de produções de recursos e quantidade total produzida"
                />
                <MetricItem 
                  label="Gastos" 
                  value={`${metrics.edgeTypeStats.cost.count} (-${metrics.edgeTypeStats.cost.totalQuantity})`}
                  tooltip="Número total de consumos de recursos e quantidade total consumida"
                />
              </Box>
            </MetricSection>

            <MetricSection
              title="Produção e Consumo"
              description="Identifica os recursos mais produzidos e consumidos. Recursos com alta demanda e baixa produção podem ser problemas."
              expanded={expandedSections.production}
              onToggle={() => toggleSection('production')}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC107' }}>
                    Top Produtores
                  </Typography>
                  {metrics.productionConsumption.topProducers.map((res) => (
                    <ResourceChip key={res.name} resource={res} type="production" />
                  ))}
                </Box>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC107' }}>
                    Top Consumidores
                  </Typography>
                  {metrics.productionConsumption.topConsumers.map((res) => (
                    <ResourceChip key={res.name} resource={res} type="consumption" />
                  ))}
                </Box>
              </Box>
              <Divider sx={{ my: 2, backgroundColor: '#555' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Typography sx={{ color: 'white' }}>
                  <strong>Total Produzido:</strong> 
                  <span style={{ color: '#4CAF50', marginLeft: 8, fontWeight: 'bold' }}>
                    +{metrics.productionConsumption.totalProduction}
                  </span>
                </Typography>
                <Typography sx={{ color: 'white' }}>
                  <strong>Total Consumido:</strong> 
                  <span style={{ color: '#F44336', marginLeft: 8, fontWeight: 'bold' }}>
                    -{metrics.productionConsumption.totalConsumption}
                  </span>
                </Typography>
              </Box>
            </MetricSection>

            <MetricSection
              title="Análise de Caminhos e Ciclos"
              description="Mostra como os recursos estão conectados e dependentes entre si. Caminhos longos podem indicar cadeias complexas, ciclos podem criar loops infinitos."
              expanded={expandedSections.pathAnalysis}
              onToggle={() => toggleSection('pathAnalysis')}
            >
              {metrics.pathAnalysis.mostDemandedResource && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC107' }}>
                    Recurso Mais Demandado
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 193, 7, 0.1)', 
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid #FFC107'
                  }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                      <MetricItem label="Recurso" value={metrics.pathAnalysis.mostDemandedResource.name} />
                      <MetricItem label="Demanda" value={metrics.pathAnalysis.mostDemandedResource.outDegree} />
                      <MetricItem label="Produção" value={metrics.pathAnalysis.mostDemandedResource.inDegree} />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: '#FFC107' }}>
                      Este recurso é consumido por muitas cartas mas tem poucas fontes de produção, podendo se tornar um gargalo.
                    </Typography>
                  </Box>
                </>
              )}

              {metrics.pathAnalysis.hasCycles && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC107' }}>
                    Ciclos Detectados
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: 'white' }}>
                      <strong>Total:</strong> {metrics.pathAnalysis.cycleExamples.length} ciclos
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                      Ciclos podem criar loops infinitos ou combos poderosos. Verifique se são intencionais.
                    </Typography>
                    {metrics.pathAnalysis.cycleExamples.map((cycle, i) => (
                      <Paper key={i} sx={{ 
                        p: 1, 
                        mb: 1, 
                        backgroundColor: 'rgba(255, 193, 7, 0.05)',
                        border: '1px solid rgba(255, 193, 7, 0.3)'
                      }}>
                        <Typography variant="body2" fontFamily="monospace" sx={{ color: '#FFC107' }}>
                          {cycle.join(" → ")} → {cycle[0]}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}

              <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC107' }}>
                Caminhos Mais Curtos Entre Recursos
              </Typography>
              {Object.keys(metrics.pathAnalysis.shortestPaths).length > 0 ? (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: 2,
                  maxHeight: 300,
                  overflow: 'auto',
                  p: 1
                }}>
                  {Object.entries(metrics.pathAnalysis.shortestPaths).map(([start, ends]) => (
                    <Paper key={start} sx={{ 
                      p: 2, 
                      backgroundColor: '#424242',
                      border: '1px solid #555'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#2196F3' }}>
                        De: {start}
                      </Typography>
                      {Object.entries(ends).map(([end, path]) => (
                        <Box key={end} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            <strong>Para {end}:</strong>
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace" sx={{ ml: 1, color: '#4CAF50' }}>
                            {path.join(" → ")}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#ccc' }}>
                            Passos: {path.length - 1}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: 'white' }}>Nenhum caminho entre recursos encontrado</Typography>
              )}
            </MetricSection>
          </>
        ) : (
          <BalanceAnalysisPanel metrics={metrics} />
        )}
      </Paper>
    </div>
  );
};

export default GraphMetrics;