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
    dispatch({type: GameActions.DIMINUI_ACAO})
  }

  function onCartaClick(carta: CartaType) {
    console.log("carta clicada", carta);

    const newGame = structuredClone(game);

    carta.ganho.forEach((ganho) => {
      const recurso = newGame.recursos.find((r) => r.nome === ganho.nome);
      if (recurso) {
        recurso.quantidade += ganho.quantidade;
      } else {
        newGame.recursos.push(structuredClone(ganho));
      }
    });
    if (newGame.recursos.some((r) => r.quantidade < 0)) {
      console.log("Não pode jogar essa carta");
      return;
    }

    const index = newGame.mao.findIndex(c=>c === carta);

    newGame.descarte.push(...newGame.mao.splice(index,1));

    if(newGame.mao.length === 0){
      while(newGame.mao.length < 3){
        if(newGame.baralho.length > 0){
          newGame.mao.push(newGame.baralho.pop()!);
        }
        else{
          if(newGame.descarte.length === 0){
            break;
          }
          newGame.baralho.push(...shuffleDeck(newGame.descarte.splice(0)));
        }
      }
    }
    //setGame(newGame);
  }

  return (
    <>
      <div>pontos: {game.pontos}</div>
      <button onClick={aumentaPonto}>Aumenta Ponto</button>
      <button onClick={diminuiAcao}>Diminui Ação</button>
      <ListaDeRecursos recursos={game.recursos} />
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

function shuffleDeck(array:Array<CartaType>) {
  for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default App;
