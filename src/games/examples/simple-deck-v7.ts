import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX7: CartaType[] = [
  {
    id: "produce_infinite",
    titulo: "Produce Infinitely",
    texto: "Produces resources infinitely",
    custo: [],
    ganho: [{ nome: "infinite resource", quantidade: 1 }],
  },
];

export const OFERTA_EX7: CartaType[] = [];

export const GAME_EX7 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX7,
  baralhoDaOferta: OFERTA_EX7,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 3 },
    { nome: "infinite resource", quantidade: 0 },
  ],
  pontosParaVencer: 100,
  turnosMaximos: 50,
};

// Unlimited growth (potential ω)