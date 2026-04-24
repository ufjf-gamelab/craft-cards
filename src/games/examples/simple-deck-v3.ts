import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX3: CartaType[] = [
  { id: "mine", titulo: "Minério", texto: "", custo: [], ganho: [{ nome: "ouro", quantidade: 1 }] },
  { id: "sword", titulo: "Espada", texto: "", custo: [{ nome: "ouro", quantidade: 1 }], ganho: [] },
  { id: "shield", titulo: "Escudo", texto: "", custo: [{ nome: "ouro", quantidade: 1 }], ganho: [] },
  { id: "helmet", titulo: "Capacete", texto: "", custo: [{ nome: "ouro", quantidade: 1 }], ganho: [] },
];

export const OFERTA_EX3: CartaType[] = [];

export const GAME_EX3 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX3,
  baralhoDaOferta: OFERTA_EX3,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação"),
  ],
};

//Gargalo de produção (alto consumo, baixa produção)