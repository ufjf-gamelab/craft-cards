import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
  setupNewGame,
} from "./Game.ts";
import { useContext, useEffect } from "react";
import Oferta from "./Oferta.tsx";
import Historico from "./Historico.tsx";
import HistoricoLog from "./HistoricoLog.tsx";
import Jogador from "./Jogador.tsx";
import ResourcePetriNet from "./ResourcePetriNet";
import React from "react";
import ResourceGraph from "./ResourceGraph.tsx";
import GraphMetrics from "./GraphMetrics.tsx";
import { loadGameState, saveGameState } from "./persistance.ts";
import { GAME_INITIAL } from "./data/cartas.ts";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;

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

  function resetGame() {
    dispatch({ type: GameActions.RESET_GAME });
  }

  // Carregar o jogo salvo quando o componente montar
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedGame = await loadGameState();
        
        if (savedGame) {
          console.log('Jogo salvo encontrado, carregando...', {
            mao: savedGame.mao.length,
            emJogo: savedGame.emJogo.length,
            recursos: savedGame.recursos.length
          });
          
          // Dispatch para carregar o jogo salvo
          dispatch({
            type: GameActions.LOAD_GAME,
            payload: {
              ...savedGame,
              resourceGraph: undefined, // Não carregamos o graph
              analisesVisiveis: savedGame.analisesVisiveis || false,
              activeTab: savedGame.activeTab || "graph"
            }
          });
        } else {
          console.log('Nenhum jogo salvo encontrado, iniciando novo jogo...');
          // Inicia um novo jogo
          const newGame = setupNewGame(GAME_INITIAL);
          dispatch({
            type: GameActions.LOAD_GAME,
            payload: newGame
          });
        }
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        // Em caso de erro, inicia um novo jogo
        const newGame = setupNewGame(GAME_INITIAL);
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: newGame
        });
      }
    };

    loadSavedGame();
  }, []);

  // Salvar automaticamente quando o jogo muda
  useEffect(() => {
    if (game && game.mao.length > 0) {
      console.log('Salvando jogo...', {
        mao: game.mao.length,
        emJogo: game.emJogo.length
      });
      saveGameState(game);
    }
  }, [game]);

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
          <button className="control-button warning" onClick={resetGame}>
            Reset Game
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
                    <HistoricoLog />
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
