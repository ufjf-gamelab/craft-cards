export type CartaType = {
  id: string;
  titulo: string;
  texto: string;
  custo: number;
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
    custo: 0,
    ganho: [{ nome: "madeira", quantidade: 1 }],
  },
  {
    id: "a1",
    titulo: "Pegar água",
    texto: "",
    custo: 0,
    ganho: [{ nome: "água", quantidade: 1 }],
  },
  {
    id: "b1",
    titulo: "Pegar amora",
    texto: "",
    custo: 2,
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
];

export const BARALHO_INICIAL: Array<CartaType> = [
  {
    id: "p1",
    titulo: "Pegar pedra",
    texto: "",
    custo: 1,
    ganho: [{ nome: "pedra", quantidade: 1 }],
  },
  {
    id: "a2",
    titulo: "Beber água",
    texto: "",
    custo: 0,
    ganho: [
      { nome: "água", quantidade: -1 },
      { nome: "ação", quantidade: 1 },
    ],
  },
  {
    id: "m2",
    titulo: "Pegar madeira",
    texto: "",
    custo: 0,
    ganho: [{ nome: "madeira", quantidade: 2 }],
  },
  {
    id: "m3",
    titulo: "Pegar madeira",
    texto: "",
    custo: 0,
    ganho: [{ nome: "madeira", quantidade: 1 }],
  },
  {
    id: "a3",
    titulo: "Pegar água",
    texto: "",
    custo: 0,
    ganho: [{ nome: "água", quantidade: 1 }],
  },
  {
    id: "a4",
    titulo: "Beber água",
    texto: "",
    custo: 0,
    ganho: [
      { nome: "água", quantidade: -1 },
      { nome: "ação", quantidade: 1 },
    ],
  },
  {
    id: "p2",
    titulo: "Pegar pedra",
    texto: "",
    custo: 1,
    ganho: [{ nome: "pedra", quantidade: 1 }],
  },
  {
    id: "b2",
    titulo: "Pegar amora",
    texto: "",
    custo: 2,
    ganho: [{ nome: "amora", quantidade: 1 }],
  },
  {
    id: "m4",
    titulo: "Pegar madeira",
    texto: "",
    custo: 0,
    ganho: [{ nome: "madeira", quantidade: 2 }],
  },
];