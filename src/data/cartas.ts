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
  { nome: "pontuacao", quantidade: 0 },
  { nome: "acao", quantidade: 5 }
];

export const DESCARTE_INICIAL: Array<CartaType> = [];

export const MAO_INICIAL: Array<CartaType> = [];

export const BARALHO_INICIAL: Array<CartaType> = [
  {
    id: "m1",
    titulo: "Pegar madeira",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "madeira bruta", quantidade: 1 }],
  },
  {
    id: "a1",
    titulo: "Pegar agua",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "agua", quantidade: 1 }],
  },
  {
    id: "pa1",
    titulo: "Pegar amora",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
  {
    id: "p1",
    titulo: "Pegar pedra",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "pedra bruta", quantidade: 2 }],
  },
  {
    id: "m2",
    titulo: "Pegar madeira",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "madeira bruta", quantidade: 2 }],
  },
  {
    id: "a3",
    titulo: "Pegar agua",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "agua", quantidade: 2 }],
  },
  {
    id: "pa3",
    titulo: "Pegar amora",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "amora", quantidade: 2 }],
  },
  {
    id: "p3",
    titulo: "Pegar pedra",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "pedra bruta", quantidade: 2 }],
  },
  {
    id: "b2",
    titulo: "Beber agua",
    texto: "",
    custo: [{ nome: "agua", quantidade: 1 }],
    ganho: [{ nome: "acao", quantidade: 1 }],
  },
  {
    id: "c2",
    titulo: "Comer amora",
    texto: "",
    custo: [{ nome: "amora", quantidade: 1 }],
    ganho: [{ nome: "acao", quantidade: 1 }],
  },
  {
    id: "s1",
    titulo: "Serralheria basica",
    texto: "",
    custo: [{ nome: "madeira bruta", quantidade: 2 }],
    ganho: [{ nome: "tabua", quantidade: 1 }],
  },
  {
    id: "pb1",
    titulo: "Pedreira basica",
    texto: "",
    custo: [{ nome: "pedra bruta", quantidade: 2 }],
    ganho: [{ nome: "pedra polida", quantidade: 1 }],
  },
  {
    id: "f1",
    titulo: "Fabricar machado",
    texto: "",
    custo: [
      { nome: "tabua", quantidade: 1 },
      { nome: "pedra polida", quantidade: 1 },
    ],
    ganho: [{ nome: "machado", quantidade: 1 }],
  },
  {
    id: "f2",
    titulo: "Fabricar picareta",
    texto: "",
    custo: [
      { nome: "tabua", quantidade: 1 },
      { nome: "pedra polida", quantidade: 1 },
    ],
    ganho: [{ nome: "picareta", quantidade: 1 }],
  },
];

export const BARALHO_OFERTA_INICIAL: Array<CartaType> = [
  {
    id: "a2",
    titulo: "Pegar agua",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "agua", quantidade: 1 }],
  },
  {
    id: "b1",
    titulo: "Beber agua",
    texto: "",
    custo: [{ nome: "agua", quantidade: 1 }],
    ganho: [{ nome: "acao", quantidade: 1 }],
  },
  {
    id: "c1",
    titulo: "Comer amora",
    texto: "",
    custo: [{ nome: "amora", quantidade: 1 }],
    ganho: [{ nome: "acao", quantidade: 1 }],
  },
  {
    id: "p2",
    titulo: "Pegar pedra",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "pedra bruta", quantidade: 1 }],
  },
  {
    id: "pa2",
    titulo: "Pegar amora",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
  {
    id: "m3",
    titulo: "Pegar madeira",
    texto: "",
    custo: [{ nome: "acao", quantidade: 1 }],
    ganho: [{ nome: "madeira bruta", quantidade: 2 }],
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