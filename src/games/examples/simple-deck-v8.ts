import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX8: CartaType[] = [
  {
    id: "prepare",
    titulo: "Prepare",
    texto: "Prepares the reagent",
    custo: [{ nome: "action", quantidade: 1 }],
    ganho: [{ nome: "reagent", quantidade: 1 }],
  },
  {
    id: "synthesize",
    titulo: "Synthesize",
    texto: "Reagent + Catalyst → Score",
    custo: [
      { nome: "action", quantidade: 1 },
      { nome: "reagent", quantidade: 1 },
      { nome: "catalyst", quantidade: 1 },
    ],
    ganho: [{ nome: "score", quantidade: 5 }],
  },
];

export const OFERTA_EX8: CartaType[] = [];

export const GAME_EX8 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX8,
  baralhoDaOferta: OFERTA_EX8,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 2 },
    { nome: "reagent", quantidade: 0 },
    { nome: "catalyst", quantidade: 1 },
  ],
  pontosParaVencer: 20,
  turnosMaximos: 15,
};