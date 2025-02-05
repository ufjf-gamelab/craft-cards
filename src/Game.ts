import { GameType } from "./data/cartas";

export enum GameActions {
  AUMENTA_PONTO = "aumenta ponto",
  DIMINUI_ACAO = "diminui ação",
}

type AumentaPontoActionType = {
  type: GameActions.AUMENTA_PONTO;
}
type DiminuiAcaoActionType = {
  type: GameActions.DIMINUI_ACAO;
}
type GameActionType = AumentaPontoActionType | DiminuiAcaoActionType;

export function gameReducer(game: GameType, action: GameActionType): GameType {
  switch (action.type) {
    case GameActions.AUMENTA_PONTO:
      return aumentaPontoAction(game, action);

    case GameActions.DIMINUI_ACAO:
      return diminuiAcaoAction(game, action);

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
