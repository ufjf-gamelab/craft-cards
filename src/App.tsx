import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
  setupNewGame,
  checkGameFinished,
  GameFinishReason,
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
import { CartaType, GAME_INITIAL } from "./data/cartas";
import PersistenceDropdown from "./PersistanceDropdown.tsx";
import { availableModels } from "./models/index.ts";
import TutorialModal from "./TutorialModal.tsx";
import CardEditor, { DeckMembership } from "./CardEditor.tsx";

type AnalysisTab = "petriNet" | "graph" | "historico";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seedInput, setSeedInput] = useState("");
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finishReason, setFinishReason] = useState<GameFinishReason>("none");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [currentModelKey, setCurrentModelKey] = useState<string>(
    "Simple v6 (deadlock)"
  );
  const [gameModel, setGameModel] = useState<any>(null);
  const [customModel, setCustomModel] = useState<any>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const customModelFileInputRef = useRef<HTMLInputElement>(null);

  // ---- Estado do editor de cartas ----
  const [cardEditorOpen, setCardEditorOpen] = useState(false);
  // Contador usado para forçar remontagem do painel de análises (grafo, Petri net, métricas)
  const [modelVersion, setModelVersion] = useState(0);

  useEffect(() => {
    if (isCustomModel || !currentModelKey) return;

    availableModels[currentModelKey]()
      .then((model) => {
        setGameModel(model);
        setCustomModel(null);
        setIsCustomModel(false);
        const newGame = setupNewGame(model);
        setGameFinished(false);
        setFinalScore(null);
        setFinishReason("none");
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: newGame,
        });
      })
      .catch(console.error);
  }, [currentModelKey, dispatch, isCustomModel]);

  useEffect(() => {
    if (!gameFinished) {
      const result = checkGameFinished(game);
      if (result.finished) {
        setFinalScore(result.score);
        setFinishReason(result.reason);
        setGameFinished(true);
      }
    }
  }, [game, gameFinished]);

  useEffect(() => {
    if (isLightTheme) {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [isLightTheme]);

  const toggleTheme = () => {
    setIsLightTheme((prev) => !prev);
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
        setFinishReason("none");
        setIsCustomModel(false);
        setCustomModel(null);
        setCardEditorOpen(false);
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
        setFinishReason("none");
        setIsCustomModel(false);
        setCustomModel(null);
        setCardEditorOpen(false);
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
    const activeModel = isCustomModel ? customModel : gameModel;
    if (activeModel) {
      const newGame = setupNewGame(activeModel);
      setGameFinished(false);
      setFinalScore(null);
      setFinishReason("none");
      dispatch({ type: GameActions.LOAD_GAME, payload: newGame });
    }
  };

  const handleNewGameWithSeed = () => {
    const activeModel = isCustomModel ? customModel : gameModel;
    if (activeModel) {
      const newGame = setupNewGame(activeModel, seedInput || undefined);
      setGameFinished(false);
      setFinalScore(null);
      setFinishReason("none");
      dispatch({ type: GameActions.LOAD_GAME, payload: newGame });
    }
  };

  const handleLoadCustomModel = () => {
    customModelFileInputRef.current?.click();
  };

  const handleCustomModelSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedModel = JSON.parse(text);

      if (
        !parsedModel.baralho ||
        !parsedModel.baralhoDaOferta ||
        !parsedModel.recursos
      ) {
        console.error(
          "JSON invalido: faltam campos obrigatorios (baralho, baralhoDaOferta, recursos)"
        );
        alert(
          "Erro: O arquivo JSON precisa ter os campos: baralho, baralhoDaOferta, recursos"
        );
        return;
      }

      const fullModel = {
        ...GAME_INITIAL,
        baralho: parsedModel.baralho,
        baralhoDaOferta: parsedModel.baralhoDaOferta,
        recursos: parsedModel.recursos,
        pontosParaVencer:
          parsedModel.pontosParaVencer ?? GAME_INITIAL.pontosParaVencer,
        turnosMaximos: parsedModel.turnosMaximos ?? GAME_INITIAL.turnosMaximos,
        ...(parsedModel.seed !== undefined && { seed: parsedModel.seed }),
      };

      setCustomModel(fullModel);
      setIsCustomModel(true);
      setCardEditorOpen(false);

      const newGame = setupNewGame(fullModel);
      setGameFinished(false);
      setFinalScore(null);
      setFinishReason("none");
      dispatch({ type: GameActions.LOAD_GAME, payload: newGame });

      alert(
        `Regras carregadas! Vitoria: ${fullModel.pontosParaVencer} pontos ou ${fullModel.turnosMaximos} turnos.`
      );
    } catch (error) {
      console.error("Erro ao ler/parsear o JSON:", error);
      alert("Erro ao ler o arquivo JSON. Verifique se o formato esta correto.");
    }

    event.target.value = "";
  };

  const handleModelChange = (key: string) => {
    setIsCustomModel(false);
    setCustomModel(null);
    setCurrentModelKey(key);
    setCardEditorOpen(false);
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
    if (!gameModel && !customModel) return [];
    const sourceModel = isCustomModel ? customModel : gameModel;
    if (!sourceModel) return [];
    const map = new Map<string, CartaType>();
    [...sourceModel.baralho, ...sourceModel.baralhoDaOferta].forEach(
      (card: CartaType) => {
        if (!map.has(card.id)) map.set(card.id, card);
      }
    );
    return Array.from(map.values());
  }, [gameModel, customModel, isCustomModel]);

  const availableResources = React.useMemo(() => {
    const set = new Set<string>();
    game.recursos.forEach((r) => set.add(r.nome));
    allCards.forEach((c) => {
      c.custo.forEach((r) => set.add(r.nome));
      c.ganho.forEach((r) => set.add(r.nome));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [game.recursos, allCards]);

  const deckMembership: DeckMembership = React.useMemo(() => {
    const sourceModel = isCustomModel ? customModel : gameModel;
    if (!sourceModel) return {};
    const baralhoIds = new Set<string>(
      sourceModel.baralho.map((c: CartaType) => c.id)
    );
    const ofertaIds = new Set<string>(
      sourceModel.baralhoDaOferta.map((c: CartaType) => c.id)
    );
    const map: DeckMembership = {};
    allCards.forEach((c) => {
      map[c.id] = {
        baralho: baralhoIds.has(c.id),
        oferta: ofertaIds.has(c.id),
      };
    });
    return map;
  }, [allCards, gameModel, customModel, isCustomModel]);

  const handleCardEditorSave = (updatedCards: CartaType[]) => {
    const map = new Map(updatedCards.map((c) => [c.id, c]));

    const patchModel = (model: any) => ({
      ...model,
      baralho: model.baralho.map((c: CartaType) => map.get(c.id) ?? c),
      baralhoDaOferta: model.baralhoDaOferta.map(
        (c: CartaType) => map.get(c.id) ?? c
      ),
    });

    if (isCustomModel) {
      setCustomModel((prev: any) => (prev ? patchModel(prev) : prev));
    } else {
      setGameModel((prev: any) => (prev ? patchModel(prev) : prev));
    }

    // Atualiza as cartas ativas no estado do jogo (mão, baralho, oferta, etc.)
    dispatch({ type: GameActions.UPDATE_CARDS, cards: updatedCards });

    // Força remontagem do painel de análises (grafo, Petri net, métricas)
    setModelVersion((v) => v + 1);
  };

  const getFinishMessage = () => {
    switch (finishReason) {
      case "pontos":
        return `Vitoria! Voce atingiu ${finalScore} pontos!`;
      case "turnos":
        return `Fim dos turnos! Voce fez ${finalScore} pontos.`;
      case "deadlock":
        return `Jogo Travado! Sem acoes e sem cartas para jogar/comprar. Pontuacao final: ${finalScore}`;
      default:
        return `Fim de Jogo! Pontuacao final: ${finalScore}`;
    }
  };

  return (
    <div className="game-app">
      <TutorialModal
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />

      {gameFinished && (
        <div className="game-finished-banner" data-reason={finishReason}>
          <div className="banner-content">
            <span>{getFinishMessage()}</span>
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
            onChange={(e) => handleModelChange(e.target.value)}
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
            Diminui Acao
          </button>
          <button
            className="control-button"
            onClick={aumentaPonto}
            disabled={gameFinished}
          >
            Aumenta Ponto
          </button>
          <button className="control-button" onClick={toggleAnalises}>
            {game.analisesVisiveis ? "Ocultar Analises" : "Mostrar Analises"}
          </button>
          <button
            className="control-button"
            onClick={() => setCardEditorOpen((v) => !v)}
            title="Editar cartas do modelo atual"
          >
            {cardEditorOpen ? "Fechar Editor" : "Editar Cartas"}
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
            onLoadCustomModel={handleLoadCustomModel}
          />

          <button
            className="control-button"
            onClick={() => setTutorialOpen(true)}
            style={{
              backgroundColor: "var(--button-bg)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Abrir tutorial sobre como usar modelos JSON"
          >
            Ajuda?
          </button>
        </div>
      </div>

      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileSelected}
      />

      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={customModelFileInputRef}
        onChange={handleCustomModelSelected}
      />

      <div className="main-content">
        {cardEditorOpen && (
          <CardEditor
            key={`editor-${isCustomModel ? "custom" : currentModelKey}`}
            onClose={() => setCardEditorOpen(false)}
            cards={allCards}
            availableResources={availableResources}
            deckMembership={deckMembership}
            onSave={handleCardEditorSave}
          />
        )}

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
          <div
            key={`analises-${modelVersion}`}
            className="analises-area visible"
          >
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
                  Historico
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