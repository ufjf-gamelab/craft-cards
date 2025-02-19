import { useReducer } from "react";
import "./App.css";
import Carta from "./Carta";
import ListaDeRecursos from "./ListaDeRecursos";
import ListaDeCartas from "./ListaDeCartas.tsx";
import {CartaType,GAME_INITIAL} from "./data/cartas.ts";
import { GameActions, gameReducer, setupNewGame } from "./Game.ts";



function App() {

  const [game,dispatch] = useReducer(gameReducer, GAME_INITIAL, setupNewGame);

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
    dispatch({type: GameActions.COMPRAR_CARTA, carta});
  }

  return (
    <>
      <div>pontos: {game.pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <button onClick={diminuiAcao}>Diminui Ação</button>
      <button onClick={passarTurno}>Passar Turno</button>
      <ListaDeRecursos recursos={game.recursos} />
      <h2>Baralho da Oferta</h2>
      <ListaDeCartas>
        {game.baralhoDaOferta.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
            }}
          />
        ))}
      </ListaDeCartas>
      <h2>Oferta</h2>
      <ListaDeCartas>
        {game.oferta.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCompraCartaClick(item);
            }}
          />
        ))}
      </ListaDeCartas>
      <h2>Descarte da Oferta</h2>
      <ListaDeCartas>
        {game.descarteDaOferta.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              
            }}
          />
        ))}
      </ListaDeCartas>
      <h2>Mão</h2>
      <ListaDeCartas>
        {game.mao.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCartaClick(item);
            }}
          />
        ))}
      </ListaDeCartas>
      <h2>Descarte</h2>
      <ListaDeCartas>
        {game.descarte.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </ListaDeCartas>
      <h2>Baralho</h2>
      <ListaDeCartas>
        {game.baralho.map((item) => (
          <Carta
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
          />
        ))}
      </ListaDeCartas>
    </>
  );
}

export default App;
