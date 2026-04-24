import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX8: CartaType[] = [
  {
    id: "make_gold",
    titulo: "Fazer Ouro",
    texto: "",
    custo: [],
    ganho: [{ nome: "ouro", quantidade: 1 }],
  },
  {
    id: "use_diamond",
    titulo: "Usar Diamante",
    texto: "",
    custo: [{ nome: "diamante", quantidade: 1 }],
    ganho: [{ nome: "pontuação", quantidade: 5 }],
  },
];

export const OFERTA_EX8: CartaType[] = [];

export const GAME_EX8 = {
  ...GAME_INITIAL,
  baralho: BARALHO_EX8,
  baralhoDaOferta: OFERTA_EX8,
  recursos: [
    { nome: "pontuação", quantidade: 0 },
    { nome: "ação", quantidade: 3 },
    ...GAME_INITIAL.recursos.filter(r => r.nome !== "pontuação" && r.nome !== "ação"),
  ],
};

//Transição morta (carta nunca jogável)