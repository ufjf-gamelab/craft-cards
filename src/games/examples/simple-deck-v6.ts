import { CartaType, GAME_INITIAL } from "../../data/cartas";

export const BARALHO_EX6: CartaType[] = [
  {
  id: "pegarA",
  titulo: "Pegar A",
  texto: "Pega uma unidade de A.",
  custo: [],      // nenhum custo
  ganho: [{ nome: "A", quantidade: 1 }]
},
{
  id: "pegarB",
  titulo: "Pegar B",
  texto: "Pega uma unidade de B.",
  custo: [],
  ganho: [{ nome: "B", quantidade: 1 }]
},
{
  id: "usarAeB",
  titulo: "Usar A e B",
  texto: "Consome uma unidade de A e uma de B.",
  custo: [{ nome: "A", quantidade: 1 }, { nome: "B", quantidade: 1 }],
  ganho: []       // consome ambos sem produzir nada
}
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