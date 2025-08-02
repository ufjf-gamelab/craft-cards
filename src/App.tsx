import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
} from "./Game.ts";
import { useContext } from "react";
import Oferta from "./Oferta.tsx";
import Historico from "./Historico.tsx";
import Jogador from "./Jogador.tsx";
import ResourcePetriNet from "./ResourcePetriNet";
import React from "react";
import ResourceGraph from "./ResourceGraph.tsx";
import GraphMetrics from "./GraphMetrics.tsx";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;

  if (game === null || dispatch === null) {
    return <p>Carregando...</p>;
  }

  function aumentaPonto() {
    dispatch({ type: GameActions.AUMENTA_PONTO });
  }

  function diminuiAcao() {
    dispatch({ type: GameActions.DIMINUI_ACAO });
  }

  function passarTurno() {
    dispatch({ type: GameActions.PASSAR_TURNO });
  }

  function toggleAnalises() {
    dispatch({ type: GameActions.TOGGLE_ANALISES });
  }

  function setActiveTab(tab: AnalysisTab) {
    dispatch({
      type: GameActions.SET_ACTIVE_TAB,
      payload: tab,
    });
  }

  const playableCards = React.useMemo(() => {
    return [...game.mao].filter((card) => {
      return card.custo.every((cost) => {
        const resource = game.recursos.find((r) => r.nome === cost.nome);
        return resource && resource.quantidade >= cost.quantidade;
      });
    });
  }, [game.recursos, game.mao, game.oferta]);

  return (
    <div className="game-app">
      <div className="game-header">
        <div className="game-status">
          <div className="status-item">pontos: {game.pontos}</div>
          <ListaDeRecursos recursos={game.recursos} />
        </div>
        <div className="game-controls">
          <button className="control-button" onClick={aumentaPonto}>
            Aumenta Ponto
          </button>
          <button className="control-button" onClick={diminuiAcao}>
            Diminui Ação
          </button>
          <button className="control-button" onClick={toggleAnalises}>
            {game.analisesVisiveis ? "Ocultar Análises" : "Mostrar Análises"}
          </button>
          <button className="control-button primary" onClick={passarTurno}>
            Passar Turno
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="game-area">
          <div className="game-board">
            <div className="game-row top-row">
              <Oferta />
            </div>
            <div className="game-row bottom-row">
              <Jogador />
            </div>
          </div>
        </div>

        {game.analisesVisiveis && (
          <div className="analises-area visible">
            <div className="analises-container">
              <div className="analises-tabs">
                <button
                  className={`tab-button ${
                    game.activeTab === "petriNet" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("petriNet")}
                >
                  Petri Net
                </button>
                <button
                  className={`tab-button ${
                    game.activeTab === "graph" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("graph")}
                >
                  Graph
                </button>
                <button
                  className={`tab-button ${
                    game.activeTab === "historico" ? "active" : ""
                  }`}
                  onClick={() =>
                    dispatch({
                      type: GameActions.SET_ACTIVE_TAB,
                      payload: "historico",
                    })
                  }
                >
                  Histórico
                </button>
              </div>

              <div className="analises-content">
                {game.activeTab === "petriNet" && (
                  <div className="petri-net-container visible">
                    <ResourcePetriNet
                      recursos={game.recursos}
                      playableCards={playableCards}
                    />
                  </div>
                )}

                {game.activeTab === "graph" && (
                  <div className="graph-container visible">
                    <ResourceGraph
                      onGraphCreated={(graph) =>
                        dispatch({
                          type: GameActions.SET_GRAPH,
                          payload: graph,
                        })
                      }
                    />
                    {game.resourceGraph && (
                      <GraphMetrics graph={game.resourceGraph} />
                    )}
                  </div>
                )}

                {game.activeTab === "historico" && (
                  <div
                    className={`historico-tab-container ${
                      game.activeTab === "historico" ? "visible" : ""
                    }`}
                  >
                    <Historico />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
