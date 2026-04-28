import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX7: CartaType[] = [
  {
    id: "magic_well",
    titulo: "Poço Mágico",
    texto: "",
    custo: [{ nome: "água", quantidade: 1 }],
    ganho: [{ nome: "água", quantidade: 2 }],
  },
];

export const OFERTA_EX7: CartaType[] = [];

export const GAME_EX7 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX7,
  baralhoDaOferta: OFERTA_EX7,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    { nome: "água", quantidade: 1 }, // recurso inicial para disparar o ciclo
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação" && r.nome !== "água"),
  ],
};

// Crescimento ilimitado (potencial ω)