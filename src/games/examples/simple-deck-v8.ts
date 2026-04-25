import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX8: CartaType[] = [
  {
    id: "preparar",
    titulo: "Preparar",
    texto: "Prepara o reagente",
    custo: [{ nome: "ação", quantidade: 1 }],
    ganho: [{ nome: "reagente", quantidade: 1 }],
  },
  {
    id: "sintetizar",
    titulo: "Sintetizar",
    texto: "Reagente + Catalisador → Pontos",
    custo: [
      { nome: "ação", quantidade: 1 },
      { nome: "reagente", quantidade: 1 },
      { nome: "catalisador", quantidade: 1 },
    ],
    ganho: [{ nome: "pontuação", quantidade: 5 }],
  },
];

export const GAME_EX8 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX8,
  baralhoDaOferta: [],
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 2 },
    { nome: "reagente", quantidade: 0 },
    { nome: "catalisador", quantidade: 1 },
  ],
};