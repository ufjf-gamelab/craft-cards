import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX5: CartaType[] = [
  { id: "wood",  titulo: "Collect Wood",  texto: "", custo: [], ganho: [{ nome: "wood", quantidade: 1 }] },
  { id: "plank", titulo: "Saw",           texto: "", custo: [{ nome: "wood", quantidade: 1 }], ganho: [{ nome: "plank", quantidade: 1 }] },
  { id: "stone", titulo: "Collect Stone", texto: "", custo: [], ganho: [{ nome: "stone", quantidade: 1 }] },
  { id: "blade", titulo: "Forge Blade",   texto: "", custo: [{ nome: "stone", quantidade: 1 }], ganho: [{ nome: "blade", quantidade: 1 }] },
];

export const OFERTA_EX5: CartaType[] = [];

export const GAME_EX5 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX5,
  baralhoDaOferta: OFERTA_EX5,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "score" && r.nome !== "action"),
  ],
  pontosParaVencer: 20,
  turnosMaximos: 30,
};