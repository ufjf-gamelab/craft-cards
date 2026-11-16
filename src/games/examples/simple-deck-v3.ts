import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX3: CartaType[] = [
  { id: "mine", titulo: "Ore", texto: "", custo: [], ganho: [{ nome: "gold", quantidade: 1 }] },
  { id: "sword", titulo: "Sword", texto: "", custo: [{ nome: "gold", quantidade: 1 }], ganho: [] },
  { id: "shield", titulo: "Shield", texto: "", custo: [{ nome: "gold", quantidade: 1 }], ganho: [] },
  { id: "helmet", titulo: "Helmet", texto: "", custo: [{ nome: "gold", quantidade: 1 }], ganho: [] },
];

export const OFERTA_EX3: CartaType[] = [];

export const GAME_EX3 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX3,
  baralhoDaOferta: OFERTA_EX3,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "score" && r.nome !== "action"),
  ],
  pontosParaVencer: 10,
  turnosMaximos: 20,
};