import "./App.css";
import Carta from "./Carta";
import ListaDeRecursos from "./ListaDeRecursos";
import ListaDeCartas from "./ListaDeCartas.tsx";
import { CartaType } from "./data/cartas.ts";
import {
  GameActions,
  GameDispatchContext,
  GameReducerContext
} from "./Game.ts";
import Baralho from "./Baralho.tsx";
import Descarte from "./Descarte.tsx";
import { useContext } from "react";

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

  function onCartaClick(carta: CartaType) {
    dispatch({ type: GameActions.JOGAR_CARTA, carta });
  }

  function passarTurno() {
    dispatch({ type: GameActions.PASSAR_TURNO });
  }

  function onCompraCartaClick(carta: CartaType) {
    dispatch({ type: GameActions.COMPRAR_CARTA, carta });
  }

  function onDescarteClick() {
    console.log("teste");
  }

  return (
    <>
        <div>pontos: {game.pontos}</div>
        <button onClick={aumentaPonto}>Aumenta Ponto</button>
        <button onClick={diminuiAcao}>Diminui Ação</button>
        <button onClick={passarTurno}>Passar Turno</button>
        <ListaDeRecursos recursos={game.recursos} />

        <h2>Baralho da Oferta</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralhoDaOferta} />
          <Descarte
            onDescarteClick={onDescarteClick}
            cartas={game.descarteDaOferta}
          />
        </div>

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
            <Carta key={item.id} carta={item} onCartaClick={() => {}} />
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
        <h2>Em Jogo</h2>
        <ListaDeCartas>
          {game.emJogo.map((item) => (
            <Carta key={item.id} carta={item} onCartaClick={() => {}} />
          ))}
        </ListaDeCartas>
        <h2>Baralho</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralho} />
          <Descarte onDescarteClick={onDescarteClick} cartas={game.descarte} />
        </div>
      </>
  );
}

export default App;
