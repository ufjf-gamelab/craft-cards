import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
  setupNewGame,
} from "./Game.ts";
import { useContext, useRef } from "react";
import Oferta from "./Oferta.tsx";
import Historico from "./Historico.tsx";
import HistoricoLog from "./HistoricoLog.tsx";
import Jogador from "./Jogador.tsx";
import ResourcePetriNet from "./ResourcePetriNet";
import React from "react";
import ResourceGraph from "./ResourceGraph.tsx";
import GraphMetrics from "./GraphMetrics.tsx";
import {
  loadGameState,
  saveGameState,
  clearGameState,
  saveGameToFile,
  loadGameFromFile,
} from "./persistance.ts";
import { GAME_INITIAL } from "./data/cartas.ts";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Funções existentes do localForage
  const handleSaveGame = async () => {
    try {
      await saveGameState(game);
      alert("Jogo salvo no navegador!");
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      alert("Erro ao salvar jogo");
    }
  };

  const handleLoadGame = async () => {
    try {
      const savedGame = await loadGameState();

      if (savedGame) {
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: {
            ...savedGame,
            resourceGraph: undefined,
            analisesVisiveis: savedGame.analisesVisiveis || false,
            activeTab: savedGame.activeTab || "graph",
          },
        });
        alert("Jogo carregado do navegador!");
      } else {
        alert("Nenhum jogo salvo encontrado no navegador");
      }
    } catch (error) {
      console.error("Erro ao carregar jogo:", error);
      alert("Erro ao carregar jogo");
    }
  };

  // Novas funções para arquivo
  const handleSaveToFile = () => {
    saveGameToFile(game);
  };

  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const savedGame = await loadGameFromFile(file);

      if (savedGame) {
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: {
            ...savedGame,
            resourceGraph: undefined,
            analisesVisiveis: savedGame.analisesVisiveis || false,
            activeTab: savedGame.activeTab || "graph",
          },
        });
        alert("Jogo carregado do arquivo!");
      } else {
        alert("Erro ao carregar arquivo");
      }
    } catch (error) {
      console.error("Erro ao carregar jogo do arquivo:", error);
      alert("Erro ao carregar arquivo");
    }

    // Limpa o input para permitir carregar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetGame = () => {
    if (
      confirm(
        "Tem certeza que deseja iniciar um novo jogo? Todo o progresso será perdido."
      )
    ) {
      clearGameState();
      const newGame = setupNewGame(GAME_INITIAL);
      dispatch({
        type: GameActions.LOAD_GAME,
        payload: newGame,
      });
    }
  };

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

          {/* Grupo de persistência */}
          <div className="persistence-controls">
            <button className="control-button success" onClick={handleSaveGame}>
              Salvar (Navegador)
            </button>
            <button className="control-button info" onClick={handleLoadGame}>
              Carregar (Navegador)
            </button>
            <button
              className="control-button success"
              onClick={handleSaveToFile}
            >
              Salvar (Arquivo)
            </button>
            <button
              className="control-button info"
              onClick={handleLoadFromFile}
            >
              Carregar (Arquivo)
            </button>
            <button
              className="control-button warning"
              onClick={handleResetGame}
            >
              Novo Jogo
            </button>
          </div>
        </div>
      </div>

      {/* Input oculto para seleção de arquivo */}
      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileSelected}
      />

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
