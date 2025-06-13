import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext,
} from "./Game.ts";
import { useContext } from "react";
import Oferta from "./Oferta.tsx";
import Jogador from "./Jogador.tsx";

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

  return (
    <>
      <div className="game-app">
        <div className="game-header">
          <div className="game-status">
            <div className="status-item">pontos: {game.pontos}</div>
            <ListaDeRecursos recursos={game.recursos} />
          </div>
          <div className="game-controls">
            <button className="control-button" onClick={aumentaPonto}>Aumenta Ponto</button>
            <button className="control-button" onClick={diminuiAcao}>Diminui Ação</button>
            <button className="control-button primary" onClick={passarTurno}>Passar Turno</button>
          </div>
        </div>
        <div className="game-board">
          <div className="game-row top-row">
            <Oferta />
          </div>
          <div className="game-row bottom-row">
            <Jogador />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
