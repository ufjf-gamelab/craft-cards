import { createContext, Dispatch } from "react";
import { CartaType, GameHistoryType, GameType } from "./data/cartas";
import { MultiDirectedGraph } from "graphology";

export const GameReducerContext = createContext<GameType | null>(null);
export const GameDispatchContext =
  createContext<Dispatch<GameActionType> | null>(null);

export enum GameActions {
  AUMENTA_PONTO = "aumenta ponto",
  DIMINUI_ACAO = "diminui ação",
  JOGAR_CARTA = "jogar carta",
  PASSAR_TURNO = "passar turno",
  COMPRAR_CARTA = "comprar carta",
  TOGGLE_ANALISES = "toggle analises",
  SET_ACTIVE_TAB = "set active tab",
  SET_GRAPH = "set graph",
}

type ComprarCartaActionType = {
  type: GameActions.COMPRAR_CARTA;
  carta: CartaType;
};

type JogarCartaActionType = {
  type: GameActions.JOGAR_CARTA;
  carta: CartaType;
};

type AumentaPontoActionType = {
  type: GameActions.AUMENTA_PONTO;
};

type DiminuiAcaoActionType = {
  type: GameActions.DIMINUI_ACAO;
};

type PassarTurnoActionType = {
  type: GameActions.PASSAR_TURNO;
};

type SetActiveTabActionType = {
  type: GameActions.SET_ACTIVE_TAB;
  payload: "petriNet" | "graph" | "historico";
};

type ToggleAnalisesActionType = {
  type: GameActions.TOGGLE_ANALISES;
};

type SetGraphActionType = {
  type: GameActions.SET_GRAPH;
  payload: MultiDirectedGraph;
};

type GameActionType =
  | AumentaPontoActionType
  | DiminuiAcaoActionType
  | JogarCartaActionType
  | PassarTurnoActionType
  | ComprarCartaActionType
  | ToggleAnalisesActionType
  | SetActiveTabActionType
  | SetGraphActionType;

export function gameReducer(game: GameType, action: GameActionType): GameType {
  switch (action.type) {
    case GameActions.AUMENTA_PONTO:
      return aumentaPontoAction(game, action);

    case GameActions.DIMINUI_ACAO:
      return diminuiAcaoAction(game, action);

    case GameActions.JOGAR_CARTA:
      return jogarCartaAction(game, action);

    case GameActions.PASSAR_TURNO:
      return passarTurnoAction(game, action);

    case GameActions.COMPRAR_CARTA:
      return comprarCartaAction(game, action);

    case GameActions.TOGGLE_ANALISES:
      return {
        ...game,
        analisesVisiveis: !game.analisesVisiveis,
      };

    case GameActions.SET_ACTIVE_TAB:
      return {
        ...game,
        activeTab: action.payload,
      };

    case GameActions.SET_GRAPH:
      return {
        ...game,
        resourceGraph: action.payload,
      };

    default:
      break;
  }

  return game;
}

export function logHistory(reducer: typeof gameReducer): typeof gameReducer {
  return (state: GameType, action: GameActionType): GameType => {
    const estadoAntigo = structuredClone(state); //salva o estado antes de fazer a ação
    const novoEstado = reducer(state, action);
    const acao = action.type;

    // Cria registro se os recursos mudaram
    if (
      JSON.stringify(estadoAntigo.recursos) !==
      JSON.stringify(novoEstado.recursos)
    ) {
      const gameHistory: GameHistoryType = {
        acao: acao,
        recursos: novoEstado.recursos.map((recurso) => ({
          nome: recurso.nome,
          quantidade: recurso.quantidade,
        })),
      };

      // Adiciona o registro ao histórico do jogo
      return {
        ...novoEstado,
        historico: [...(novoEstado.historico || []), gameHistory],
      };
    }
    return novoEstado;
  };
}

function comprarCartaAction(game: GameType, action: ComprarCartaActionType) {
  console.log("carta clicada", action.carta);
  const carta = action.carta;
  const newGame = structuredClone(game);

  carta.custo.forEach((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    if (recurso) {
      recurso.quantidade -= custo.quantidade;
    } else {
      newGame.recursos.push(structuredClone(custo));
      console.log("Não pode jogar essa carta");
      return game;
    }
  });
  if (newGame.recursos.some((r) => r.quantidade < 0)) {
    console.log("Não pode jogar essa carta");
    return game;
  }

  const index = newGame.oferta.findIndex((c) => c.id === carta.id);

  newGame.descarte.push(...newGame.oferta.splice(index, 1));

  reporMao(newGame);
  reporOferta(newGame);

  return newGame;
}

function reporMao(game: GameType) {
  if (game.mao.length === 0) {
    while (game.mao.length < 3) {
      if (game.baralho.length > 0) {
        game.mao.push(game.baralho.pop()!);
      } else {
        if (game.descarte.length === 0) {
          break;
        }
        game.baralho.push(...shuffleDeck(game.descarte.splice(0)));
      }
    }
  }
}

function reporOferta(game: GameType) {
  while (game.oferta.length < 4) {
    if (game.baralhoDaOferta.length > 0) {
      game.oferta.push(game.baralhoDaOferta.pop()!);
    } else {
      if (game.descarteDaOferta.length === 0) {
        break;
      }
      game.baralhoDaOferta.push(
        ...shuffleDeck(game.descarteDaOferta.splice(0))
      );
    }
  }
}

function passarTurnoAction(game: GameType, _action: PassarTurnoActionType) {
  const newGame = structuredClone(game);

  newGame.descarte.push(...newGame.mao.splice(0));
  newGame.descarte.push(...newGame.emJogo.splice(0));

  reporMao(newGame);

  return newGame;
}

function aumentaPontoAction(game: GameType, _action: AumentaPontoActionType) {
  return { ...game, pontos: game.pontos + 1 };
}

function diminuiAcaoAction(game: GameType, _action: DiminuiAcaoActionType) {
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

function jogarCartaAction(game: GameType, action: JogarCartaActionType) {
  console.log("carta clicada", action.carta);
  const carta = action.carta;
  const newGame = structuredClone(game);

  //verificação de recursos para os custos
  const temRecursos = carta.custo.every((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    return recurso ? recurso.quantidade >= custo.quantidade : false;
  });

  if (!temRecursos) {
    console.log("Não pode jogar essa carta");
    return game;
  }

  //Aplicar custos
  carta.custo.forEach((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    if (recurso) {
      recurso.quantidade -= custo.quantidade;
    } else {
      newGame.recursos.push(structuredClone(custo));
    }
  });

  //aplicar ganhos
  carta.ganho.forEach((ganho) => {
    const recurso = newGame.recursos.find((r) => r.nome === ganho.nome);
    if (recurso) {
      recurso.quantidade += ganho.quantidade;
    } else {
      newGame.recursos.push(structuredClone(ganho));
    }
  });

  const index = newGame.mao.findIndex((c) => c.id === carta.id);

  newGame.emJogo.push(...newGame.mao.splice(index, 1));

  return newGame;
}

function shuffleDeck(array: Array<CartaType>) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function setupNewGame(game: GameType) {
  const newGame = structuredClone(game);

  shuffleDeck(newGame.baralhoDaOferta);
  shuffleDeck(newGame.baralho);

  reporOferta(newGame);
  reporMao(newGame);

  return {
    ...newGame,
    historico: [],
    analisesVisiveis: false,
    activeTab: "petriNet",
    resourceGraph: null,
  };
}
