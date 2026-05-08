import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
  setupNewGame,
  isGameFinished,
  scoreGame,
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
import { CartaType } from "./data/cartas";
import PersistenceDropdown from "./PersistanceDropdown.tsx";
import { availableModels } from "./models/index.ts";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seedInput, setSeedInput] = useState("");
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const [currentModelKey, setCurrentModelKey] = useState<string>(
    "Simple v6 (deadlock)",
  );
  const [gameModel, setGameModel] = useState<any>(null);

  useEffect(() => {
    if (!currentModelKey) return;
    availableModels[currentModelKey]()
      .then((model) => {
        setGameModel(model);
        const newGame = setupNewGame(model);
        setGameFinished(false);
        setFinalScore(null);
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: newGame,
        });
      })
      .catch(console.error);
  }, [currentModelKey, dispatch]);

  useEffect(() => {
    if (!gameFinished && isGameFinished(game)) {
      const [, score] = scoreGame(game);
      setFinalScore(score);
      setGameFinished(true);
    }
  }, [game, gameFinished]);

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
    if (gameFinished) return;
    dispatch({ type: GameActions.AUMENTA_PONTO });
  }

  function diminuiAcao() {
    if (gameFinished) return;
    dispatch({ type: GameActions.DIMINUI_ACAO });
  }

  function passarTurno() {
    if (gameFinished) return;
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
    if (gameFinished) return;
    try {
      await saveGameState(game);
    } catch (error) {}
  };

  const handleLoadGame = async () => {
    try {
      const savedGame = await loadGameState();
      if (savedGame) {
        setGameFinished(false);
        setFinalScore(null);
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
    } catch (error) {}
  };

  const handleSaveToFile = () => {
    if (gameFinished) return;
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
        setGameFinished(false);
        setFinalScore(null);
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
    } catch (error) {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetGame = () => {
    clearGameState();
    if (gameModel) {
      const newGame = setupNewGame(gameModel);
      setGameFinished(false);
      setFinalScore(null);
      dispatch({ type: GameActions.LOAD_GAME, payload: newGame });
    }
  };

  const handleNewGameWithSeed = () => {
    if (gameModel) {
      const newGame = setupNewGame(gameModel, seedInput || undefined);
      setGameFinished(false);
      setFinalScore(null);
      dispatch({ type: GameActions.LOAD_GAME, payload: newGame });
    }
  };

  const playableCards = React.useMemo(() => {
    return [...game.mao].filter((card) => {
      return card.custo.every((cost) => {
        const resource = game.recursos.find((r) => r.nome === cost.nome);
        return resource && resource.quantidade >= cost.quantidade;
      });
    });
  }, [game.recursos, game.mao]);

  const allCards = React.useMemo(() => {
    if (!gameModel) return [];
    const map = new Map<string, CartaType>();
    [...gameModel.baralho, ...gameModel.baralhoDaOferta].forEach(
      (card: CartaType) => {
        if (!map.has(card.id)) map.set(card.id, card);
      },
    );
    return Array.from(map.values());
  }, [gameModel]);

  return (
    <div className="game-app">
      {gameFinished && (
        <div className="game-finished-banner">
          <div className="banner-content">
            <span>Fim de Jogo! Pontuação final: {finalScore}</span>
            <button onClick={handleResetGame} className="reset-button">
              Novo Jogo
            </button>
          </div>
        </div>
      )}

      <div className="game-header">
        <div className="game-status">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Alternar tema"
          >
            {isLightTheme ? "Dark" : "Light"}
          </button>
          <ListaDeRecursos recursos={game.recursos} />
        </div>
        <div className="game-controls">
          <div className="current-seed">Seed atual: {game.seed}</div>
          <select
            value={currentModelKey}
            onChange={(e) => setCurrentModelKey(e.target.value)}
            className="control-button"
            style={{ backgroundColor: "var(--button-bg)" }}
          >
            {Object.keys(availableModels).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <div className="seed-controls">
            <input
              type="text"
              placeholder="Seed do jogo"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="seed-input"
              disabled={gameFinished}
            />
            <button
              className="control-button"
              onClick={handleNewGameWithSeed}
              disabled={gameFinished}
            >
              Novo Jogo com Seed
            </button>
          </div>
          <button
            className="control-button"
            onClick={diminuiAcao}
            disabled={gameFinished}
          >
            Diminui Ação
          </button>
          <button
            className="control-button"
            onClick={aumentaPonto}
            disabled={gameFinished}
          >
            Aumenta Ponto
          </button>
          <button className="control-button" onClick={toggleAnalises}>
            {game.analisesVisiveis ? "Ocultar Análises" : "Mostrar Análises"}
          </button>
          <button
            className="control-button primary"
            onClick={passarTurno}
            disabled={gameFinished}
          >
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
                  className={`tab-button ${game.activeTab === "petriNet" ? "active" : ""}`}
                  onClick={() => setActiveTab("petriNet")}
                >
                  Petri Net
                </button>
                <button
                  className={`tab-button ${game.activeTab === "graph" ? "active" : ""}`}
                  onClick={() => setActiveTab("graph")}
                >
                  Graph
                </button>
                <button
                  className={`tab-button ${game.activeTab === "historico" ? "active" : ""}`}
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
                      allCards={allCards}
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
                      allCards={allCards}
                    />
                    <GraphMetrics graph={game.resourceGraph} />
                  </div>
                )}
                {game.activeTab === "historico" && (
                  <div className="historico-tab-container visible">
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
