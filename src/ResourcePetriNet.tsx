import React, { useRef, useState, useEffect, useCallback } from "react";
import { MultiDirectedGraph } from "graphology";
import * as d3 from "d3";
import { Paper, Box, Switch, FormControlLabel, Typography } from "@mui/material";
import { BARALHO_INICIAL, BARALHO_OFERTA_INICIAL } from "./data/cartas.ts";

const OMEGA = "ω";

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
  place: "#4CAF50",
  transition: "#2196F3",
  activeTransition: "#FFC107",
};

export const LINK_COLORS = {
  input: "#F44336",
  output: "#4CAF50",
};

type Marcacao = Record<string, number | string>;

const recursosParaMarcacao = (recursos: Array<{ nome: string; quantidade: number }>): Marcacao => {
  const marcacao: Marcacao = {};
  recursos.forEach(r => marcacao[r.nome] = r.quantidade);
  return marcacao;
};

const isTransicaoHabilitada = (
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
      const cartaJogavel = playableCards.some(card => card.id === cartaId);
      if (!cartaJogavel) return false;
    }

    const arcosEntrada = graph.filterEdges((edge) => {
      const attr = graph.getEdgeAttributes(edge);
      return attr.target === transicaoId;
    });

    for (const arcoId of arcosEntrada) {
      const arco = graph.getEdgeAttributes(arcoId);
      const lugarId = arco.source;
      
      if (!graph.hasNode(lugarId)) continue;
      
      const recursoNome = graph.getNodeAttribute(lugarId, "label");
      const pesoNecessario = arco.weight;
      
      if (marcacao[recursoNome] === OMEGA) continue;
      
      const quantidadeAtual = marcacao[recursoNome] as number || 0;
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
  graph: MultiDirectedGraph<NodeAttributes, LinkAttributes> | null
): Marcacao => {
  if (!graph) return { ...marcacao };

  const novaMarcacao = { ...marcacao };

  try {
    const arcosEntrada = graph.filterEdges((edge) => {
      const attr = graph.getEdgeAttributes(edge);
      return attr.target === transicaoId;
    });

    for (const arcoId of arcosEntrada) {
      const lugarId = graph.source(arcoId);
      
      if (!graph.hasNode(lugarId)) continue;
      
      const recursoNome = graph.getNodeAttribute(lugarId, "label");
      const peso = graph.getEdgeAttribute(arcoId, "weight");

      if (novaMarcacao[recursoNome] === OMEGA) continue;
      
      const quantidadeAtual = novaMarcacao[recursoNome] as number || 0;
      novaMarcacao[recursoNome] = Math.max(0, quantidadeAtual - peso);
    }

    const arcosSaida = graph.filterEdges((edge) => {
      const attr = graph.getEdgeAttributes(edge);
      return attr.source === transicaoId;
    });

    for (const arcoId of arcosSaida) {
      const lugarId = graph.target(arcoId);
      
      if (!graph.hasNode(lugarId)) continue;
      
      const recursoNome = graph.getNodeAttribute(lugarId, "label");
      const peso = graph.getEdgeAttribute(arcoId, "weight");

      if (novaMarcacao[recursoNome] === OMEGA) continue;
      
      const quantidadeAtual = novaMarcacao[recursoNome] as number || 0;
      novaMarcacao[recursoNome] = quantidadeAtual + peso;
    }
  } catch (error) {
    console.error("Erro ao disparar transição:", error);
  }

  return novaMarcacao;
};

const ResourcePetriNetTeste: React.FC<ResourcePetriNetProps> = ({
  recursos,
  playableCards,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [petriNetInitialized, setPetriNetInitialized] = useState(false);
  const simulationRef = useRef<any>(null);
  const graphRef = useRef<MultiDirectedGraph<NodeAttributes, LinkAttributes> | null>(null);
  const nodeGroupsRef = useRef<any>(null);

  const [marcacaoAtual, setMarcacaoAtual] = useState<Marcacao>(recursosParaMarcacao(recursos));
  const [marcacaoModoLivre, setMarcacaoModoLivre] = useState<Marcacao>({});
  const [transicoesHabilitadas, setTransicoesHabilitadas] = useState<string[]>([]);
  const [modoLivre, setModoLivre] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inicializar marcação do modo livre
  useEffect(() => {
    const initialMarcacao: Marcacao = {};
    recursos.forEach(r => {
      initialMarcacao[r.nome] = 0;
    });
    setMarcacaoModoLivre(initialMarcacao);
  }, [recursos]);

  // Obter marcação atual baseada no modo
  const getMarcacaoAtual = useCallback(() => {
    return modoLivre ? marcacaoModoLivre : recursosParaMarcacao(recursos);
  }, [modoLivre, marcacaoModoLivre, recursos]);

  // Atualizar transições habilitadas quando recursos mudarem
  useEffect(() => {
    atualizarTransicoesHabilitadas();
  }, [recursos, playableCards, modoLivre, marcacaoModoLivre]);

  // Inicializar a rede apenas uma vez
  useEffect(() => {
    if (!petriNetInitialized) {
      initPetriNet();
    }
  }, [petriNetInitialized]);

  // Atualizar visualizações quando recursos ou cartas mudarem (modo normal)
  useEffect(() => {
    if (petriNetInitialized && !modoLivre) {
      updatePetriNet();
      atualizarTransicoesHabilitadas();
    }
  }, [recursos, playableCards, petriNetInitialized, modoLivre]);

  // Atualizar visualizações quando a marcação do modo livre mudar
  useEffect(() => {
    if (petriNetInitialized && modoLivre) {
      updatePetriNet();
      atualizarTransicoesHabilitadas();
    }
  }, [marcacaoModoLivre, petriNetInitialized, modoLivre]);

  // SOLUÇÃO: handleNodeClick atualizado para chamar updatePetriNet imediatamente após setState
  const handleNodeClick = useCallback((nodeId: string, nodeLabel: string) => {
    if (!modoLivre) return;
    
    setLoading(true);
    try {
      const recursoNome = nodeLabel;
      
      setMarcacaoModoLivre(prevMarcacao => {
        const novaMarcacao = { ...prevMarcacao };
        
        if (novaMarcacao[recursoNome] === OMEGA) {
          novaMarcacao[recursoNome] = OMEGA;
        } else {
          const quantidadeAtual = novaMarcacao[recursoNome] as number || 0;
          novaMarcacao[recursoNome] = quantidadeAtual + 1;
        }
        
        // SOLUÇÃO: Forçar atualização visual imediata após a mudança de estado
        setTimeout(() => {
          if (petriNetInitialized) {
            updatePetriNet();
          }
        }, 0);
        
        return novaMarcacao;
      });
    } catch (error) {
      console.error("Erro ao adicionar token:", error);
    } finally {
      setLoading(false);
    }
  }, [modoLivre, petriNetInitialized]);

  const atualizarTransicoesHabilitadas = useCallback(() => {
    if (!graphRef.current) {
      setTransicoesHabilitadas([]);
      return;
    }

    try {
      const currentMarcacao = getMarcacaoAtual();
      const habilitadas = graphRef.current
        .nodes()
        .filter(node => graphRef.current?.getNodeAttribute(node, 'type') === 'transition')
        .filter(transicaoId => 
          isTransicaoHabilitada(transicaoId, currentMarcacao, playableCards, graphRef.current, modoLivre)
        );

      setTransicoesHabilitadas(habilitadas);
    } catch (error) {
      console.error("Erro ao atualizar transições habilitadas:", error);
      setTransicoesHabilitadas([]);
    }
  }, [getMarcacaoAtual, playableCards, modoLivre]);

  const testarDisparoTransicao = (transicaoId: string) => {
    if (!graphRef.current) return;

    setLoading(true);
    try {
      const currentMarcacao = getMarcacaoAtual();
      const novaMarcacao = dispararTransicao(transicaoId, currentMarcacao, graphRef.current);
      
      if (modoLivre) {
        setMarcacaoModoLivre(novaMarcacao);
        // SOLUÇÃO: Forçar atualização visual imediatamente após setState
        setTimeout(() => {
          if (petriNetInitialized) {
            updatePetriNet();
          }
        }, 0);
      } else {
        setMarcacaoAtual(novaMarcacao);
      }
    } catch (error) {
      console.error("Erro ao disparar transição:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModoLivreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    try {
      const novoModoLivre = event.target.checked;
      setModoLivre(novoModoLivre);
      
      if (nodeGroupsRef.current) {
        nodeGroupsRef.current.each(function(this: SVGGElement, d: any) {
          if (d.type === "place") {
            d3.select(this).select("circle")
              .style("cursor", novoModoLivre ? "pointer" : "default");
            d3.select(this).select(".token-count")
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
    const initialMarcacao: Marcacao = {};
    recursos.forEach(r => {
      initialMarcacao[r.nome] = 0;
    });
    setMarcacaoModoLivre(initialMarcacao);
    // SOLUÇÃO: Forçar atualização visual imediatamente após setState
    setTimeout(() => {
      if (petriNetInitialized) {
        updatePetriNet();
      }
    }, 0);
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

    // Criar transições (cartas)
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

    // Criar lugares (recursos)
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

    // Criar arcos
    allCards.forEach((carta) => {
      const transitionId = `transition_${carta.id}`;

      carta.custo.forEach((custo) => {
        const placeId = `place_${custo.nome}`;
        if (graph.hasNode(placeId)) {
          graph.addDirectedEdge(placeId, transitionId, {
            source: placeId,
            target: transitionId,
            weight: custo.quantidade,
            color: LINK_COLORS.input,
          });
        }
      });

      carta.ganho.forEach((ganho) => {
        const placeId = `place_${ganho.nome}`;
        if (graph.hasNode(placeId)) {
          graph.addDirectedEdge(transitionId, placeId, {
            source: transitionId,
            target: placeId,
            weight: ganho.quantidade,
            color: LINK_COLORS.output,
          });
        }
      });
    });

    // Converter para formato D3
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
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2)
      .attr("marker-end", (d: any) => `url(#arrowhead-${d.color.replace("#", "")})`);

    // Nós
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

    // Renderizar nós
    nodeGroupsRef.current.each(function(this: SVGGElement, d: NodeAttributes) {
      const nodeGroup = d3.select<SVGGElement, NodeAttributes>(this);

      if (d.type === "place") {
        nodeGroup
          .append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("cursor", modoLivre ? "pointer" : "default")
          .on("click", () => handleNodeClick(d.id, d.label));

        // SOLUÇÃO: Adicionar a classe token-count corretamente e evento de clique
        nodeGroup
          .append("text")
          .attr("class", "token-count")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-weight", "bold")
          .style("cursor", modoLivre ? "pointer" : "default")
          .style("pointer-events", "all") // Permitir eventos de clique no texto
          .text(getMarcacaoAtual()[d.label] || 0)
          .on("click", () => handleNodeClick(d.id, d.label));

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

    // Rótulos dos arcos
    const linkLabels = g
      .append("g")
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

      nodeGroupsRef.current.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      linkLabels
        .attr("x", (d: any) => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", (d: any) => ((d.source as any).y + (d.target as any).y) / 2);
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

    // Ajustar zoom
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

    setTimeout(() => {
      adjustZoom();
      setPetriNetInitialized(true);
    }, 500);
  };

  // SOLUÇÃO: Método updatePetriNet atualizado para garantir atualização visual imediata
  const updatePetriNet = () => {
    if (!petriNetInitialized || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentMarcacao = getMarcacaoAtual();

    // Atualiza tokens dos lugares
    svg.selectAll<SVGTextElement, any>(".token-count").text(function () {
      const parentData: any = d3.select(this.parentNode as Element).datum();
      if (!parentData || parentData.type !== "place") return "0";
      return String(currentMarcacao[parentData.label] ?? 0);
    });

    // Atualiza cores das transições
    svg.selectAll<SVGRectElement, any>(".transition-node").attr("fill", function () {
      const nodeData: any = d3.select(this.parentNode as Element).datum();
      if (!nodeData || nodeData.type !== "transition") return nodeData?.color ?? NODE_COLORS.transition;

      const isHabilitada = isTransicaoHabilitada(
        nodeData.id,
        currentMarcacao,
        playableCards,
        graphRef.current,
        modoLivre
      );

      return isHabilitada ? NODE_COLORS.activeTransition : NODE_COLORS.transition;
    });
  };

  return (
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Modo Livre</Typography>
              {modoLivre && (
                <Box
                  sx={{
                    ml: 1,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'green',
                    animation: 'pulse 1s infinite'
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
              marginBottom: '10px', 
              padding: '5px 10px', 
              fontSize: '12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            Resetar Modo Livre
          </button>
        )}
        
        {loading && <Typography variant="body2" color="primary">Carregando...</Typography>}
        
        <p><strong>Modo:</strong> {modoLivre ? "Livre" : "Normal"}</p>
        
        <p><strong>Marcação Atual:</strong></p>
        <pre style={{ fontSize: "10px", backgroundColor: "#f5f5f5", padding: "5px", borderRadius: "3px" }}>
          {JSON.stringify(getMarcacaoAtual(), null, 2)}
        </pre>
        
        <p><strong>Transições Habilitadas ({transicoesHabilitadas.length}):</strong></p>
        <ul style={{ fontSize: "10px", paddingLeft: "15px", marginBottom: "10px" }}>
          {transicoesHabilitadas.map(id => (
            <li key={id} style={{ marginBottom: "3px" }}>
              {id.replace('transition_', '')}
              <button 
                onClick={() => testarDisparoTransicao(id)}
                style={{ marginLeft: '10px', fontSize: '8px', padding: '2px 5px' }}
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
  );
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

export default ResourcePetriNetTeste;