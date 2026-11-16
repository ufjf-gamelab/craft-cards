import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX4: CartaType[] = [
  {
    id: "a_to_b",
    titulo: "A → B",
    texto: "",
    custo: [{ nome: "A", quantidade: 1 }],
    ganho: [{ nome: "B", quantidade: 1 }],
  },
  {
    id: "b_to_a",
    titulo: "B → A",
    texto: "",
    custo: [{ nome: "B", quantidade: 1 }],
    ganho: [{ nome: "A", quantidade: 1 }],
  },
];

export const OFERTA_EX4: CartaType[] = [];

export const GAME_EX4 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX4,
  baralhoDaOferta: OFERTA_EX4,
  recursos: [
    { nome: "score", quantidade: 0 },
    { nome: "action", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "score" && r.nome !== "action"),
  ],
};

// Simple cycle (cycle detection)