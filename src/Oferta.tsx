import { useContext } from "react";
import Baralho from "./Baralho";
import Carta from "./Carta";
import Descarte from "./Descarte";
import { GameActions, GameDispatchContext, GameReducerContext } from "./Game";
import { CartaType } from "./data/cartas";
import ListaDeCartas from "./ListaDeCartas";
import ResourceGraphD3 from "./ResourceGraph";
import ResourceGraph from "./ResourceGraph";

export default function Oferta() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  function onDescarteClick() {
    console.log("teste");
  }
  function onCompraCartaClick(carta: CartaType) {
    dispatch({ type: GameActions.COMPRAR_CARTA, carta });
  }
  return (
    <>
      <div className="lista-de-cartas-container">
        <h2>Baralho da Oferta</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralhoDaOferta} />
          <Descarte
            onDescarteClick={onDescarteClick}
            cartas={game.descarteDaOferta}
          />
        </div>
      </div>
      <div className="lista-de-cartas-container">
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
      </div>
      <div className="lista-de-cartas-container">
        <ResourceGraph></ResourceGraph>
      </div>
    </>
  );
}
