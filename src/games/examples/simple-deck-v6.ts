import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX6: CartaType[] = [
  {
    id: "consumirX",
    titulo: "Consumir X",
    texto: "Custa 1 X, não produz nada.",
    custo: [{ nome: "X", quantidade: 1 }],
    ganho: []
  },
  {
    id: "consumirY",
    titulo: "Consumir Y",
    texto: "Custa 1 Y, não produz nada.",
    custo: [{ nome: "Y", quantidade: 1 }],
    ganho: []
  },
  {
    id: "trocarXporY",
    titulo: "Trocar X por Y",
    texto: "Custa 1 X, produz 1 Y.",
    custo: [{ nome: "X", quantidade: 1 }],
    ganho: [{ nome: "Y", quantidade: 1 }]
  },
  {
    id: "trocarYporX",
    titulo: "Trocar Y por X",
    texto: "Custa 1 Y, produz 1 X.",
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
  ]
};

//Deadlock (estado terminal)