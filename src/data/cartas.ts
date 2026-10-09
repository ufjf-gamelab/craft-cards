import { MultiDirectedGraph } from "graphology";

export type GameHistoryType = {
  turno: number;
  acoes: {
    tipo: string;
    recursos: Array<{
      nome: string;
      quantidade: number;
    }>;
  }[];
};

export type GameType = {
  recursos: Array<RecursoType>;
  mao: Array<CartaType>;
  emJogo: Array<CartaType>;
  descarte: Array<CartaType>;
  baralho: Array<CartaType>;
  oferta: Array<CartaType>;
  baralhoDaOferta: Array<CartaType>;
  descarteDaOferta: Array<CartaType>;
  historico?: Array<GameHistoryType>;
  showPetriNet: boolean;
  showGraph: boolean;
  showHistorico?: boolean;
  resourceGraph?: MultiDirectedGraph;
  activeTab?: "petriNet" | "graph" | "historico";
  analisesVisiveis?: boolean;
  seed: string;
  pontosParaVencer?: number;
  turnosMaximos?: number;
};

export type CartaType = {
  id: string;
  titulo: string;
  texto: string;
  custo: Array<RecursoType>;
  ganho: Array<RecursoType>;
};

export type RecursoType = {
  nome: string;
  quantidade: number;
};

export const RECURSOS_INICIAL: Array<RecursoType> = [
  { nome: "score", quantidade: 0 },
  { nome: "action", quantidade: 5 },
];

export const DESCARTE_INICIAL: Array<CartaType> = [];

export const MAO_INICIAL: Array<CartaType> = [];

export const BARALHO_INICIAL: Array<CartaType> = [
  {
    id: "m1",
    titulo: "Collect Wood",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw wood", quantidade: 1 }],
  },
  {
    id: "a1",
    titulo: "Collect Water",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "water", quantidade: 1 }],
  },
  {
    id: "pa1",
    titulo: "Collect Blackberry",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "blackberry", quantidade: 1 }],
  },
  {
    id: "p1",
    titulo: "Collect Stone",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw stone", quantidade: 2 }],
  },
  {
    id: "m2",
    titulo: "Collect Wood",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw wood", quantidade: 2 }],
  },
  {
    id: "a3",
    titulo: "Collect Water",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "water", quantidade: 2 }],
  },
  {
    id: "pa3",
    titulo: "Collect Blackberry",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "blackberry", quantidade: 2 }],
  },
  {
    id: "p3",
    titulo: "Collect Stone",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw stone", quantidade: 2 }],
  },
  {
    id: "b2",
    titulo: "Drink Water",
    texto: "",
    custo: [{ nome: "water", quantidade: 1 }],
    ganho: [{ nome: "action", quantidade: 1 }],
  },
  {
    id: "c2",
    titulo: "Eat Blackberry",
    texto: "",
    custo: [{ nome: "blackberry", quantidade: 1 }],
    ganho: [{ nome: "action", quantidade: 1 }],
  },
  {
    id: "s1",
    titulo: "Basic Sawmill",
    texto: "",
    custo: [{ nome: "raw wood", quantidade: 2 }],
    ganho: [{ nome: "plank", quantidade: 1 }],
  },
  {
    id: "pb1",
    titulo: "Basic Quarry",
    texto: "",
    custo: [{ nome: "raw stone", quantidade: 2 }],
    ganho: [{ nome: "polished stone", quantidade: 1 }],
  },
  {
    id: "f1",
    titulo: "Craft Axe",
    texto: "",
    custo: [
      { nome: "plank", quantidade: 1 },
      { nome: "polished stone", quantidade: 1 },
    ],
    ganho: [{ nome: "axe", quantidade: 1 }],
  },
  {
    id: "f2",
    titulo: "Craft Pickaxe",
    texto: "",
    custo: [
      { nome: "plank", quantidade: 1 },
      { nome: "polished stone", quantidade: 1 },
    ],
    ganho: [{ nome: "pickaxe", quantidade: 1 }],
  },
];

export const BARALHO_OFERTA_INICIAL: Array<CartaType> = [
  {
    id: "a2",
    titulo: "Collect Water",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "water", quantidade: 1 }],
  },
  {
    id: "b1",
    titulo: "Drink Water",
    texto: "",
    custo: [{ nome: "water", quantidade: 1 }],
    ganho: [{ nome: "action", quantidade: 1 }],
  },
  {
    id: "c1",
    titulo: "Eat Blackberry",
    texto: "",
    custo: [{ nome: "blackberry", quantidade: 1 }],
    ganho: [{ nome: "action", quantidade: 1 }],
  },
  {
    id: "p2",
    titulo: "Collect Stone",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw stone", quantidade: 1 }],
  },
  {
    id: "pa2",
    titulo: "Collect Blackberry",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "blackberry", quantidade: 1 }],
  },
  {
    id: "m3",
    titulo: "Collect Wood",
    texto: "",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "raw wood", quantidade: 2 }],
  },
];

export const GAME_INITIAL = {
  recursos: RECURSOS_INICIAL,
  mao: MAO_INICIAL,
  emJogo: [],
  descarte: DESCARTE_INICIAL,
  baralho: BARALHO_INICIAL,
  oferta: [],
  baralhoDaOferta: BARALHO_OFERTA_INICIAL,
  descarteDaOferta: [],
  showPetriNet: false,
  showGraph: true,
  historico: [],
  showHistorico: false,
  seed: "",
  pontosParaVencer: 10,
  turnosMaximos: 30,
};