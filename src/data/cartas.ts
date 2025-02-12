export type GameType = {
  pontos: number; 
  recursos: Array<RecursoType>;
  mao: Array<CartaType>;
  descarte: Array<CartaType>;
  baralho: Array<CartaType>;
  oferta: Array<CartaType>;
}

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
  { nome: "ação", quantidade: 1 },
  { nome: "madeira", quantidade: 0 },
];

export const DESCARTE_INICIAL: Array<CartaType> = [];


export const MAO_INICIAL: Array<CartaType> = [
  {
    id: "m1",
    titulo: "Pegar madeira",
    texto: "",
    custo: [],
    ganho: [{ nome: "madeira", quantidade: 1 }],
  },
  {
    id: "a1",
    titulo: "Pegar água",
    texto: "",
    custo: [],
    ganho: [{ nome: "água", quantidade: 1 }],
  },
  {
    id: "b1",
    titulo: "Pegar amora",
    texto: "",
    custo: [],
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
];

export const BARALHO_INICIAL: Array<CartaType> = [
  {
    id: "p1",
    titulo: "Pegar pedra",
    texto: "",
    custo: [],
    ganho: [{ nome: "pedra", quantidade: 1 }],
  },
  {
    id: "a2",
    titulo: "Beber água",
    texto: "",
    custo: [],
    ganho: [
      { nome: "água", quantidade: -1 },
      { nome: "ação", quantidade: 1 },
    ],
  },
  {
    id: "m2",
    titulo: "Pegar madeira",
    texto: "",
    custo: [],
    ganho: [{ nome: "madeira", quantidade: 2 }],
  },
];
export const OFERTA_INICIAL: Array<CartaType> = [
  {
    id: "m3",
    titulo: "Machado de Madeira",
    texto: "",
    custo: [{ nome: "madeira", quantidade: -2 }],
    ganho: [{ nome: "madeira", quantidade: 3 }],
  },
  {
    id: "a3",
    titulo: "Pegar água",
    texto: "",
    custo: [],
    ganho: [{ nome: "água", quantidade: 1 }],
  },
  {
    id: "a4",
    titulo: "Beber água",
    texto: "",
    custo: [],
    ganho: [
      { nome: "água", quantidade: -1 },
      { nome: "ação", quantidade: 1 },
    ],
  },
  {
    id: "p2",
    titulo: "Pegar pedra",
    texto: "",
    custo: [],
    ganho: [{ nome: "pedra", quantidade: 1 }],
  },
  {
    id: "b2",
    titulo: "Pegar amora",
    texto: "",
    custo: [],
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
  {
    id: "m4",
    titulo: "Pegar madeira",
    texto: "",
    custo: [],
    ganho: [{ nome: "madeira", quantidade: 2 }],
  },
];

export const GAME_INITIAL = {
  pontos: 0, 
  recursos: RECURSOS_INICIAL,
  mao: MAO_INICIAL,
  descarte: DESCARTE_INICIAL,
  baralho: BARALHO_INICIAL,
  oferta: OFERTA_INICIAL
};
