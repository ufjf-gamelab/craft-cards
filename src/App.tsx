import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext
} from "./Game.ts";
import { useContext } from "react";
import Oferta from "./Oferta.tsx";
import Jogador from "./Jogador.tsx";

function App() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  if(game === null || dispatch === null){
    return <p>Carregando...</p>
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
        <div>pontos: {game.pontos}</div>
        <button onClick={aumentaPonto}>Aumenta Ponto</button>
        <button onClick={diminuiAcao}>Diminui Ação</button>
        <button onClick={passarTurno}>Passar Turno</button>
        <ListaDeRecursos recursos={game.recursos} />
        <Oferta/>
        <Jogador/>
      </>
  );
}

export default App;
