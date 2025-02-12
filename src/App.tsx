import { useReducer } from "react";
import "./App.css";
import Carta from "./Carta";
import ListaDeRecursos from "./ListaDeRecursos";
import MaoDeCartas from "./MaoDeCartas";
import {CartaType,GAME_INITIAL} from "./data/cartas.ts";
import { GameActions, gameReducer } from "./Game.ts";



function App() {

  const [game,dispatch] = useReducer(gameReducer, GAME_INITIAL);

  function aumentaPonto() {
    dispatch({type: GameActions.AUMENTA_PONTO});
  }

  function diminuiAcao() {
    dispatch({type: GameActions.DIMINUI_ACAO});
  }

  function onCartaClick(carta: CartaType) {
    dispatch({type: GameActions.JOGAR_CARTA, carta});
  }

  function passarTurno(){
    dispatch({type: GameActions.PASSAR_TURNO});
  }

  function onCompraCartaClick(carta: CartaType) {
    dispatch({type: GameActions.JOGAR_CARTA, carta});
  }

  return (
    <>
      <div>pontos: {game.pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <button onClick={diminuiAcao}>Diminui Ação</button>
      <button onClick={passarTurno}>Passar Turno</button>
      <ListaDeRecursos recursos={game.recursos} />
      <h2>Oferta</h2>
      <MaoDeCartas>
        {game.oferta.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCompraCartaClick(item);
            }}
          />
        ))}
      </MaoDeCartas>
      <h2>Mão</h2>
      <MaoDeCartas>
        {game.mao.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCartaClick(item);
            }}
          />
        ))}
      </MaoDeCartas>
      <h2>Descarte</h2>
      <MaoDeCartas>
        {game.descarte.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </MaoDeCartas>
      <h2>Baralho</h2>
      <MaoDeCartas>
        {game.baralho.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </MaoDeCartas>
    </>
  );
}

export default App;
