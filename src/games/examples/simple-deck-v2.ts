import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX2: CartaType[] = [
  {
    id: "produce_trash",
    titulo: "Gerar Lixo",
    texto: "",
    custo: [],
    ganho: [{ nome: "lixo", quantidade: 1 }],
  },
  // Nenhuma carta consome "lixo"
];

export const OFERTA_EX2: CartaType[] = [];

export const GAME_EX2 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX2,
  baralhoDaOferta: OFERTA_EX2,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação"),
  ],
};

//Recurso órfão (subsistema desconectado)