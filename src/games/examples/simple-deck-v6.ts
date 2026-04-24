import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX6: CartaType[] = [
  {
    id: "work",
    titulo: "Trabalhar",
    texto: "",
    custo: [{ nome: "ação", quantidade: 1 }],
    ganho: [{ nome: "pontuação", quantidade: 1 }],
  },
  // Nenhuma carta produz "ação" (sem "rest" nem "eat_snack")
];

export const OFERTA_EX6: CartaType[] = [];

export const GAME_EX6 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX6,
  baralhoDaOferta: OFERTA_EX6,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 1 }, // começa com apenas 1 ação
  ],
};

//Deadlock (estado terminal)