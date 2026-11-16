import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX6: CartaType[] = [
  {
    id: "consume_x",
    titulo: "Consume X",
    texto: "Costs 1 X, produces nothing.",
    custo: [{ nome: "X", quantidade: 1 }],
    ganho: []
  },
  {
    id: "consume_y",
    titulo: "Consume Y",
    texto: "Costs 1 Y, produces nothing.",
    custo: [{ nome: "Y", quantidade: 1 }],
    ganho: []
  },
  {
    id: "trade_x_for_y",
    titulo: "Trade X for Y",
    texto: "Costs 1 X, produces 1 Y.",
    custo: [{ nome: "X", quantidade: 1 }],
    ganho: [{ nome: "Y", quantidade: 1 }]
  },
  {
    id: "trade_y_for_x",
    titulo: "Trade Y for X",
    texto: "Costs 1 Y, produces 1 X.",
    custo: [{ nome: "Y", quantidade: 1 }],
    ganho: [{ nome: "X", quantidade: 1 }]
  }
];

export const OFERTA_EX6: CartaType[] = [];

export const GAME_EX6 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX6,
  baralhoDaOferta: OFERTA_EX6,
  recursos: [
    { nome: "X", quantidade: 1 },
    { nome: "Y", quantidade: 0 }
  ],
  pontosParaVencer: 999,
  turnosMaximos: 20,
};