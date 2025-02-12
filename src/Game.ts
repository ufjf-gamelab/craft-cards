import { CartaType, GameType } from "./data/cartas";

export enum GameActions {
  AUMENTA_PONTO = "aumenta ponto",
  DIMINUI_ACAO = "diminui ação",
  JOGAR_CARTA = "jogar carta",
}

type JogarCartaActionType = {
  type: GameActions.JOGAR_CARTA;
  carta: CartaType;
}

type AumentaPontoActionType = {
  type: GameActions.AUMENTA_PONTO;
}
type DiminuiAcaoActionType = {
  type: GameActions.DIMINUI_ACAO;
}
type GameActionType = AumentaPontoActionType | DiminuiAcaoActionType | JogarCartaActionType;

export function gameReducer(game: GameType, action: GameActionType): GameType {
  switch (action.type) {
    case GameActions.AUMENTA_PONTO:
      return aumentaPontoAction(game, action);

    case GameActions.DIMINUI_ACAO:
      return diminuiAcaoAction(game, action);

    case GameActions.JOGAR_CARTA:
      return jogarCartaAction(game, action);

    default:
      break;
  }

  return game;
}

function aumentaPontoAction(game:GameType, _action:AumentaPontoActionType) {
  return { ...game, pontos: game.pontos + 1 };
}

function diminuiAcaoAction(game:GameType, _action:DiminuiAcaoActionType) {
  const newGame = structuredClone(game);
  newGame.recursos = newGame.recursos.map((r) => {
    if (r.nome === "ação") {
      return { ...r, quantidade: r.quantidade - 1 };
    } else {
      return r;
    }
  });
  return newGame;
}

function jogarCartaAction(game:GameType, action:JogarCartaActionType){
  console.log("carta clicada", action.carta);
    const carta = action.carta;
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
      return game;
    }

    const index = newGame.mao.findIndex(c=>c.id === carta.id);

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

  return newGame;
}

function shuffleDeck(array:Array<CartaType>) {
  for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}