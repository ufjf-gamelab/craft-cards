import { useContext, useState } from "react";
import Baralho from "./Baralho";
import Carta from "./Carta";
import Descarte from "./Descarte";
import { GameActions, GameDispatchContext, GameReducerContext } from "./Game";
import { CartaType } from "./data/cartas";
import ListaDeCartas from "./ListaDeCartas";
import { motion } from "motion/react";
import { createPortal } from "react-dom";

export default function Jogador() {
  const game = useContext(GameReducerContext)!;
  const dispatch = useContext(GameDispatchContext)!;
  function onDescarteClick() {
    console.log("teste");
  }
  function onCartaClick(carta: CartaType) {
    dispatch({ type: GameActions.JOGAR_CARTA, carta });
    animaMovimento(carta.id);
  }

  const [posicoes, setPosicoes] = useState<{[key: string]: DOMRect}>({});
  const [cartaMovida, setCartaMovida] = useState<{key: string , rect: DOMRect} | null>(null);

  function animaMovimento(id: string) {
    const destino = posicoes[id];
    if(!destino) return;
    setCartaMovida({key: id, rect: destino});
  }

  function onCardRender(id: string, rect: DOMRect) {
    setPosicoes((prev) => ({ ...prev, [id]: rect }));
  }
  return (
    <>
      <h2>Mão</h2>
      {cartaMovida && (
        createPortal(<motion.div 
        initial={{ opacity: 0, scale: 0, top:0, left:0, position: "absolute" }}
        animate={{ opacity: 1, scale: 1, left: cartaMovida.rect.x, top: cartaMovida.rect.y }}
        transition={{
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
        >{cartaMovida.key}
        {cartaMovida.rect.x}
        {cartaMovida.rect.y}
        </motion.div>, document.body)
      )}
        <ListaDeCartas>
          {game.mao.map((item) => (
            <Carta
              onCardRender={onCardRender}
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
            <Carta 
            onCardRender={onCardRender}
            key={item.id} carta={item} onCartaClick={() => {}} />
          ))}
        </ListaDeCartas>
        <h2>Baralho</h2>
        <div className="baralho-container">
          <Baralho cartas={game.baralho} />
          <Descarte 
          onCardRender={onCardRender}
          onDescarteClick={onDescarteClick} cartas={game.descarte} />
        </div>
    </>
  );
}
