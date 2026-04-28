import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX5: CartaType[] = [
  // Grupo 1: madeira → tábua
  { id: "wood", titulo: "Coletar Madeira", texto: "", custo: [], ganho: [{ nome: "madeira", quantidade: 1 }] },
  { id: "plank", titulo: "Serra", texto: "", custo: [{ nome: "madeira", quantidade: 1 }], ganho: [{ nome: "tábua", quantidade: 1 }] },
  // Grupo 2: pedra → lâmina (sem relação com o grupo 1)
  { id: "stone", titulo: "Coletar Pedra", texto: "", custo: [], ganho: [{ nome: "pedra", quantidade: 1 }] },
  { id: "blade", titulo: "Forjar Lâmina", texto: "", custo: [{ nome: "pedra", quantidade: 1 }], ganho: [{ nome: "lâmina", quantidade: 1 }] },
];

export const OFERTA_EX5: CartaType[] = [];

export const GAME_EX5 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX5,
  baralhoDaOferta: OFERTA_EX5,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação"),
  ],
};

//Dois componentes desconexos