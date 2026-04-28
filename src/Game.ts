import { createContext, Dispatch } from "react";
import { CartaType, GameType } from "./data/cartas";
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
  LOAD_GAME = "load game",
}

type LoadGameActionType = {
  type: GameActions.LOAD_GAME;
  payload: GameType;
};

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
  | SetGraphActionType
  | LoadGameActionType;

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

    case GameActions.LOAD_GAME:
      return action.payload;

    default:
      break;
  }

  return game;
}

export function logHistory(reducer: typeof gameReducer): typeof gameReducer {
  return (state: GameType, action: GameActionType): GameType => {
    const estadoAntigo = structuredClone(state);
    const novoEstado = reducer(state, action);
    
    if (action.type === GameActions.PASSAR_TURNO) {
      return novoEstado;
    }

    if (JSON.stringify(estadoAntigo.recursos) !== JSON.stringify(novoEstado.recursos)) {
      const gameHistoryEntry = {
        tipo: action.type,
        recursos: novoEstado.recursos.map(recurso => ({
          nome: recurso.nome,
          quantidade: recurso.quantidade
        }))
      };

      if (!novoEstado.historico || novoEstado.historico.length === 0) {
        const newTurn = {
          turno: 1,
          acoes: [gameHistoryEntry]
        };
        return {
          ...novoEstado,
          historico: [newTurn]
        };
      }

      const lastIndex = novoEstado.historico.length - 1;
      const updatedHistorico = [...novoEstado.historico];
      updatedHistorico[lastIndex] = {
        ...updatedHistorico[lastIndex],
        acoes: [...updatedHistorico[lastIndex].acoes, gameHistoryEntry]
      };
      
      return {
        ...novoEstado,
        historico: updatedHistorico
      };
    }
    
    return novoEstado;
  };
}

function comprarCartaAction(game: GameType, action: ComprarCartaActionType) {
  const carta = action.carta;
  const newGame = structuredClone(game);

  carta.custo.forEach((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    if (recurso) {
      recurso.quantidade -= custo.quantidade;
    } else {
      return game;
    }
  });
  if (newGame.recursos.some((r) => r.quantidade < 0)) {
    return game;
  }

  const index = newGame.oferta.findIndex((c) => c.id === carta.id);
  if (index === -1) {
    return game;
  }
  newGame.descarte.push(...newGame.oferta.splice(index, 1));

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
        game.baralho.push(...shuffleDeck(game.descarte.splice(0), game.seed));
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
        ...shuffleDeck(game.descarteDaOferta.splice(0), game.seed)
      );
    }
  }
}

function passarTurnoAction(game: GameType, _action: PassarTurnoActionType) {
  const newGame = structuredClone(game);

  newGame.descarte.push(...newGame.mao.splice(0));
  newGame.descarte.push(...newGame.emJogo.splice(0));

  reporMao(newGame);

  const novoTurno = {
    turno: (newGame.historico?.length || 0) + 1,
    acoes: []
  };

  return {
    ...newGame,
    historico: [...(newGame.historico || []), novoTurno]
  };
}

function aumentaPontoAction(game: GameType, _action: AumentaPontoActionType) {
  const newGame = structuredClone(game);
  const pontuacao = newGame.recursos.find(r => r.nome === "pontuação");
  if (pontuacao) {
    pontuacao.quantidade += 1;
  } else {
    newGame.recursos.push({ nome: "pontuação", quantidade: 1 });
  }
  return newGame;
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
  const carta = action.carta;
  const newGame = structuredClone(game);

  const temRecursos = carta.custo.every((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    return recurso ? recurso.quantidade >= custo.quantidade : false;
  });

  if (!temRecursos) {
    return game;
  }

  carta.custo.forEach((custo) => {
    const recurso = newGame.recursos.find((r) => r.nome === custo.nome);
    if (recurso) {
      recurso.quantidade -= custo.quantidade;
    } else {
      newGame.recursos.push(structuredClone(custo));
    }
  });

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

function shuffleDeck(array: Array<CartaType>, seed: string) {
  const seededRandom = new SeededRandom(seed);
  return seededRandom.shuffle(array);
}

export function setupNewGame(game: GameType, seed?: string): GameType {
  const newGame = structuredClone(game);
  const gameSeed = seed || Math.random().toString(36).substring(2, 15);
  
  newGame.seed = gameSeed;

  const seededRandom = new SeededRandom(gameSeed);
  newGame.baralhoDaOferta = seededRandom.shuffle(newGame.baralhoDaOferta);
  newGame.baralho = seededRandom.shuffle(newGame.baralho);

  reporOferta(newGame);
  reporMao(newGame);

  if (!newGame.recursos.some(r => r.nome === "pontuação")) {
    newGame.recursos.push({ nome: "pontuação", quantidade: 0 });
  }

  return {
    ...newGame,
    historico: [{
      turno: 1,
      acoes: []
    }],
    analisesVisiveis: false,
    activeTab: "graph",
    resourceGraph: undefined,
  };
}

export class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private mulberry32(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  random(): number {
    return this.mulberry32();
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

function getPontuacao(game: GameType): number {
  const recursoPontuacao = game.recursos.find(r => r.nome === "pontuação");
  return recursoPontuacao ? recursoPontuacao.quantidade : 0;
}

export function isGameFinished(game: GameType): boolean {
  const PONTOS_VITORIA = 10;

  if (getPontuacao(game) >= PONTOS_VITORIA) {
    return true;
  }

  const acaoRecurso = game.recursos.find(r => r.nome === "ação");
  const hasActions = acaoRecurso ? acaoRecurso.quantidade > 0 : false;

  const playableCards = game.mao.filter(card =>
    card.custo.every(cost => {
      const resource = game.recursos.find(r => r.nome === cost.nome);
      return resource && resource.quantidade >= cost.quantidade;
    })
  );

  const buyableCards = game.oferta.filter(card =>
    card.custo.every(cost => {
      const resource = game.recursos.find(r => r.nome === cost.nome);
      return resource && resource.quantidade >= cost.quantidade;
    })
  );

  const canPlayAnyCard = playableCards.length > 0 || buyableCards.length > 0;

  if (!hasActions && !canPlayAnyCard) {
    return true;
  }

  return false;
}

export function scoreGame(game: GameType): [string, number] {
  return ["Player", getPontuacao(game)];
}