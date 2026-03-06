import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
  setupNewGame,
} from "./Game.ts";
import { useContext, useRef, useState, useEffect } from "react";
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
import PersistenceDropdown from "./PersistanceDropdown.tsx";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seedInput, setSeedInput] = useState("");
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Aplica a classe de tema ao elemento <html>
  useEffect(() => {
    if (isLightTheme) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  const toggleTheme = () => {
    setIsLightTheme(prev => !prev);
  };

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

  const handleSaveGame = async () => {
    try {
      await saveGameState(game);
    } catch (error) {
      // Erro
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
      }
    } catch (error) {
      // Erro
    }
  };

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
      }
    } catch (error) {
      // Erro
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetGame = () => {
    clearGameState();
    const newGame = setupNewGame(GAME_INITIAL);
    dispatch({
      type: GameActions.LOAD_GAME,
      payload: newGame,
    });
  };

  const playableCards = React.useMemo(() => {
    return [...game.mao].filter((card) => {
      return card.custo.every((cost) => {
        const resource = game.recursos.find((r) => r.nome === cost.nome);
        return resource && resource.quantidade >= cost.quantidade;
      });
    });
  }, [game.recursos, game.mao, game.oferta]);

  const handleNewGameWithSeed = () => {
    const newGame = setupNewGame(GAME_INITIAL, seedInput || undefined);
    dispatch({
      type: GameActions.LOAD_GAME,
      payload: newGame,
    });
  };

  return (
    <div className="game-app">
      <div className="game-header">
        <div className="game-status">
          <div className="status-item">pontos: {game.pontos}</div>
          <ListaDeRecursos recursos={game.recursos} />
        </div>
        <div className="game-controls">
          <div className="current-seed">Seed atual: {game.seed}</div>
          <div className="seed-controls">
            <input
              type="text"
              placeholder="Seed do jogo"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="seed-input"
            />
            <button className="control-button" onClick={handleNewGameWithSeed}>
              Novo Jogo com Seed
            </button>
          </div>
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
          <PersistenceDropdown
            onSaveGame={handleSaveGame}
            onLoadGame={handleLoadGame}
            onSaveToFile={handleSaveToFile}
            onLoadFromFile={handleLoadFromFile}
            onResetGame={handleResetGame}
          />
        </div>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={isLightTheme ? "Mudar para tema escuro" : "Mudar para tema claro"}
          >
            {isLightTheme ? '🌙' : '☀️'}
          </button>
      </div>

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