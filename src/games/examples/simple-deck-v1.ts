import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX1: CartaType[] = [
  {
    id: "make_stone",
    titulo: "Collect Stone",
    texto: "",
    custo: [],
    ganho: [{ nome: "stone", quantidade: 1 }],
  },
];

export const OFERTA_EX1: CartaType[] = [];

export const GAME_EX1 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX1,
  baralhoDaOferta: OFERTA_EX1,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "score" && r.nome !== "action"),
  ],
  pontosParaVencer: 5,
  turnosMaximos: 10,
};