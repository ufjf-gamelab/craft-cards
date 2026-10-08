import { useContext } from "react";
import { useTranslation } from "react-i18next";
import Baralho from "./Baralho";
import Carta from "./Carta";
import Descarte from "./Descarte";
import { GameActions, GameDispatchContext, GameReducerContext } from "./Game";
import { CartaType } from "./data/cartas";
import ListaDeCartas from "./ListaDeCartas";

export default function Oferta() {
  const { t } = useTranslation();
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
        <h2>{t("game.offer_deck")}</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralhoDaOferta} />
          <Descarte
            onDescarteClick={onDescarteClick}
            cartas={game.descarteDaOferta}
          />
        </div>
      </div>
      <div className="lista-de-cartas-container">
        <h2>{t("game.offer")}</h2>
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
    </>
  );
}