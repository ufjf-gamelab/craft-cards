import "./App.css";
import ListaDeRecursos from "./ListaDeRecursos";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext
} from "./Game.ts";
import { useContext, useRef } from "react";
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

  const passarRef = useRef<HTMLButtonElement>(null);
  function passarTurno() {
    dispatch({ type: GameActions.PASSAR_TURNO });
    console.log(passarRef.current?.getBoundingClientRect());
  }
  
  return (
    <>
        <div>pontos: {game.pontos}</div>
        <button onClick={aumentaPonto}>Aumenta Ponto</button>
        <button onClick={diminuiAcao}>Diminui Ação</button>
        <button onClick={passarTurno} ref = {passarRef}>Passar Turno</button>
        <ListaDeRecursos recursos={game.recursos} />
        <Oferta/>
        <Jogador/>
      </>
  );
}

export default App;
