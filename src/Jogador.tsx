import { useContext, useRef } from "react";
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
    animaMovimento(carta.id);
  }

  const posicoesAntigas = useRef<Map<string, DOMRect>>(new Map());
  const posicoesNovas = useRef<Map<string, DOMRect>>(new Map());

  function onCardRender(id: string, novaPosicao: DOMRect) {
    const origem = posicoesAntigas.current.get(id);
    if (!origem) {
      posicoesAntigas.current.set(id, novaPosicao);
      return;
    }
    const dist = Math.hypot(origem.x - novaPosicao.x, origem.y - novaPosicao.y);
    if (dist > 10) {
      posicoesNovas.current.set(id, novaPosicao);
    }
  }

  function animaMovimento(id: string) {
    const origem = posicoesAntigas.current.get(id);
    const destino = posicoesNovas.current.get(id);
    if (!origem || !destino) {
      return;
    }

    if (Math.hypot(destino.x - origem.x, destino.y - origem.y) > 10) {
      posicoesNovas.current.set(id, destino);
    }
  }

  return (
    <>
      Posicoes
      <ul>
        {Array.from(posicoesAntigas.current.entries()).map(([key, e]) => (
          <li key={key}>
            {key} {e.x} {e.y}
          </li>
        ))}
      </ul>
      PosicoesNovas
      <ul>
        {Array.from(posicoesNovas.current.entries()).map(([key, e]) => (
          <li key={key}>
            {key} {e.x} {e.y}
          </li>
        ))}
      </ul>
      <h2>Mão</h2>
      <ListaDeCartas>
        {game.mao.map((item) => (
          <Carta
            onCardRender={onCardRender}
            key={item.id}
            carta={item}
            onCartaClick={() => {
              onCartaClick(item);
            }}
            posicaoPrevia={posicoesNovas.current.get(item.id)}
          />
        ))}
      </ListaDeCartas>
      <h2>Em Jogo</h2>
      <ListaDeCartas>
        {game.emJogo.map((item) => (
          <Carta
            onCardRender={onCardRender}
            key={item.id}
            carta={item}
            onCartaClick={() => {}}
            posicaoPrevia={posicoesNovas.current.get(item.id)}
          />
        ))}
      </ListaDeCartas>
      <h2>Baralho</h2>
      <div className="baralho-container">
        <Baralho cartas={game.baralho} />
        <Descarte
          onCardRender={onCardRender}
          onDescarteClick={onDescarteClick}
          cartas={game.descarte}
        />
      </div>
    </>
  );
}
