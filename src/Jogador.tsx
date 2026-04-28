import { useContext } from "react";
import Baralho from "./Baralho";
import Carta from "./Carta";
import Descarte from "./Descarte";
import { GameActions, GameDispatchContext, GameReducerContext } from "./Game";
import { CartaType } from "./data/cartas";
import ListaDeCartas from "./ListaDeCartas";

export default function Jogador() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  function onDescarteClick() {
    console.log("teste");
  }
  function onCartaClick(carta: CartaType) {
    dispatch({ type: GameActions.JOGAR_CARTA, carta });
  }
  return (
    <>
      <div className="lista-de-cartas-container">
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
      </div>
      <div className="lista-de-cartas-container">
        <h2>Em Jogo</h2>
        <ListaDeCartas>
          {game.emJogo.map((item) => (
            <Carta key={item.id} carta={item} onCartaClick={() => {}} />
          ))}
        </ListaDeCartas>
      </div>
      <div className="lista-de-cartas-container">
        <h2>Baralho</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralho} />
          <Descarte onDescarteClick={onDescarteClick} cartas={game.descarte} />
        </div>
      </div>
    </>
  );
}
