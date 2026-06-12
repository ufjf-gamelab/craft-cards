import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX7: CartaType[] = [
  {
    id: "produzir_infinito",
    titulo: "Produzir Infinito",
    texto: "Produz recursos infinitamente",
    custo: [],
    ganho: [{ nome: "recursovel", quantidade: 1 }],
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
    { nome: "recursovel", quantidade: 0 },
  ],
  pontosParaVencer: 100,
  turnosMaximos: 50,
};

// Crescimento ilimitado (potencial ω)

//roteiro de construção
//proxima etapa: editor de cartas

