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

  function togglePetriNet() {
    dispatch({ type: GameActions.TOGGLE_PETRI_NET });
  }

  // Calcula as cartas jogáveis no componente pai
  const playableCards = React.useMemo(() => {
    return [...game.mao].filter(card => {
      return card.custo.every(cost => {
        const resource = game.recursos.find(r => r.nome === cost.nome);
        return resource && resource.quantidade >= cost.quantidade;
      });
    });
  }, [game.recursos, game.mao, game.oferta]);

  return (
    <>
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
            <button className="control-button" onClick={togglePetriNet}>
              {game.showPetriNet ? "Ocultar Análises" : "Mostrar Análises"}
            </button>
            <button className="control-button primary" onClick={passarTurno}>
              Passar Turno
            </button>
          </div>
        </div>

        <div className="main-content">
          {/* Área do Jogo - Sempre visível */}
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

          {/* Área de Análises - Independente */}
          <div
            className={`analises-area ${game.showPetriNet ? "visible" : ""}`}
          >
            <div className="analises-container">
              <div className="petri-net-container">
                <ResourcePetriNet 
                  recursos={game.recursos} 
                  playableCards={playableCards} 
                />
              </div>
              <div className="historico-container">
                <Historico />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
