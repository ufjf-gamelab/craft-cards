import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX1: CartaType[] = [
  {
    id: "make_stone",
    titulo: "Coletar Pedra",
    texto: "",
    custo: [],
    ganho: [{ nome: "pedra", quantidade: 1 }],
  },
];

export const OFERTA_EX1: CartaType[] = [];

export const GAME_EX1 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX1,
  baralhoDaOferta: OFERTA_EX1,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação"),
  ],
};

//Grafo básico – uma aresta de produção