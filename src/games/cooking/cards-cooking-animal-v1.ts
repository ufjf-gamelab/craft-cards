// src/games/cooking/cards_v1.ts

import { CartaType, GAME_INITIAL } from "../../data/cartas";

// ==================== BARALHO INICIAL DO JOGADOR ====================
export const BARALHO_INICIAL_V1: CartaType[] = [
  // ---------- Ingredientes básicos (custo 0) ----------
  {
    id: "gather_flour",
    titulo: "Coletar Farinha",
    texto: "",
    custo: [],
    ganho: [{ nome: "farinha", quantidade: 1 }],
  },
  {
    id: "gather_tomato",
    titulo: "Coletar Tomate",
    texto: "",
    custo: [],
    ganho: [{ nome: "tomate", quantidade: 1 }],
  },
  {
    id: "gather_cheese",
    titulo: "Coletar Queijo",
    texto: "",
    custo: [],
    ganho: [{ nome: "queijo", quantidade: 1 }],
  },
  {
    id: "gather_meat",
    titulo: "Coletar Carne",
    texto: "",
    custo: [],
    ganho: [{ nome: "carne", quantidade: 1 }],
  },
  {
    id: "gather_vegetable",
    titulo: "Coletar Vegetal",
    texto: "",
    custo: [],
    ganho: [{ nome: "vegetal", quantidade: 1 }],
  },
  {
    id: "gather_egg",
    titulo: "Coletar Ovo",
    texto: "",
    custo: [],
    ganho: [{ nome: "ovo", quantidade: 1 }],
  },
  {
    id: "gather_milk",
    titulo: "Coletar Leite",
    texto: "",
    custo: [],
    ganho: [{ nome: "leite", quantidade: 1 }],
  },
  // Novos ingredientes para os contratos
  {
    id: "gather_cream",
    titulo: "Coletar Creme de Leite",
    texto: "",
    custo: [],
    ganho: [{ nome: "creme de leite", quantidade: 1 }],
  },
  {
    id: "gather_mushroom",
    titulo: "Coletar Cogumelo",
    texto: "",
    custo: [],
    ganho: [{ nome: "cogumelo", quantidade: 1 }],
  },
  {
    id: "gather_banana",
    titulo: "Coletar Banana",
    texto: "",
    custo: [],
    ganho: [{ nome: "banana", quantidade: 1 }],
  },

  // ---------- Processados (transformações) ----------
  {
    id: "knead",
    titulo: "Amassar",
    texto: "",
    custo: [{ nome: "farinha", quantidade: 1 }],
    ganho: [{ nome: "massa", quantidade: 1 }],
  },
  {
    id: "make_sauce",
    titulo: "Fazer Molho",
    texto: "",
    custo: [
      { nome: "tomate", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "molho", quantidade: 1 }],
  },
  {
    id: "roll_dough",
    titulo: "Abrir Massa",
    texto: "",
    custo: [
      { nome: "farinha", quantidade: 1 },
      { nome: "ovo", quantidade: 1 },
    ],
    ganho: [{ nome: "massa folhada", quantidade: 1 }],
  },
  {
    id: "beat",
    titulo: "Bater",
    texto: "",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
    ],
    ganho: [{ nome: "massa líquida", quantidade: 1 }],
  },

  // ---------- Receitas tradicionais (sem pontos) ----------
  // As receitas agora produzem apenas os pratos, sem pontos
  {
    id: "pizza_margherita",
    titulo: "Pizza Margherita",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
    ],
    ganho: [{ nome: "pizza", quantidade: 1 }],
  },
  {
    id: "pizza_veg",
    titulo: "Pizza Vegetariana",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "pizza", quantidade: 1 }],
  },
  {
    id: "lasagna",
    titulo: "Lasanha à Bolonhesa",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "carne", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "molho", quantidade: 1 },
    ],
    ganho: [{ nome: "lasanha", quantidade: 1 }],
  },
  {
    id: "pasta_sauce",
    titulo: "Macarrão com Molho",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "molho", quantidade: 1 },
    ],
    ganho: [{ nome: "macarrão", quantidade: 1 }],
  },
  {
    id: "chicken_pie",
    titulo: "Torta de Frango",
    texto: "",
    custo: [
      { nome: "massa folhada", quantidade: 1 },
      { nome: "carne", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "torta", quantidade: 1 }],
  },
  {
    id: "souffle",
    titulo: "Soufflé",
    texto: "",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
    ],
    ganho: [{ nome: "soufflé", quantidade: 1 }],
  },
  // Nova receita: Strogonoff
  {
    id: "beef_strogonoff",
    titulo: "Strogonoff de Carne",
    texto: "",
    custo: [
      { nome: "carne", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
      { nome: "cogumelo", quantidade: 1 },
    ],
    ganho: [{ nome: "strogonoff", quantidade: 1 }],
  },

  // ---------- Cartas para convidar animais (geram recursos) ----------
  {
    id: "invite_elephant",
    titulo: "Convidar Elefante",
    texto: "",
    custo: [],
    ganho: [{ nome: "elefante", quantidade: 1 }],
  },
  {
    id: "invite_monkey",
    titulo: "Convidar Macaco",
    texto: "",
    custo: [],
    ganho: [{ nome: "macaco", quantidade: 1 }],
  },

  // ---------- Contratos (consomem animal + prato) ----------
  {
    id: "serve_strogonoff_elephant",
    titulo: "Servir Strogonoff ao Elefante",
    texto: "",
    custo: [
      { nome: "elefante", quantidade: 1 },
      { nome: "strogonoff", quantidade: 1 },
    ],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "serve_banana_monkey",
    titulo: "Dar Banana ao Macaco",
    texto: "",
    custo: [
      { nome: "macaco", quantidade: 1 },
      { nome: "banana", quantidade: 1 },
    ],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
];

// ==================== BARALHO DA OFERTA (MERCADO) ====================
export const BARALHO_OFERTA_INICIAL_V1: CartaType[] = [
  // Ingredientes básicos
  {
    id: "gather_flour",
    titulo: "Coletar Farinha",
    texto: "",
    custo: [],
    ganho: [{ nome: "farinha", quantidade: 1 }],
  },
  {
    id: "gather_tomato",
    titulo: "Coletar Tomate",
    texto: "",
    custo: [],
    ganho: [{ nome: "tomate", quantidade: 1 }],
  },
  {
    id: "gather_cheese",
    titulo: "Coletar Queijo",
    texto: "",
    custo: [],
    ganho: [{ nome: "queijo", quantidade: 1 }],
  },
  {
    id: "gather_meat",
    titulo: "Coletar Carne",
    texto: "",
    custo: [],
    ganho: [{ nome: "carne", quantidade: 1 }],
  },
  {
    id: "gather_cream",
    titulo: "Coletar Creme de Leite",
    texto: "",
    custo: [],
    ganho: [{ nome: "creme de leite", quantidade: 1 }],
  },
  {
    id: "gather_mushroom",
    titulo: "Coletar Cogumelo",
    texto: "",
    custo: [],
    ganho: [{ nome: "cogumelo", quantidade: 1 }],
  },
  {
    id: "gather_banana",
    titulo: "Coletar Banana",
    texto: "",
    custo: [],
    ganho: [{ nome: "banana", quantidade: 1 }],
  },
  // Processados
  {
    id: "knead",
    titulo: "Amassar",
    texto: "",
    custo: [{ nome: "farinha", quantidade: 1 }],
    ganho: [{ nome: "massa", quantidade: 1 }],
  },
  {
    id: "make_sauce",
    titulo: "Fazer Molho",
    texto: "",
    custo: [
      { nome: "tomate", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "molho", quantidade: 1 }],
  },
  // Receitas tradicionais (sem pontos)
  {
    id: "pizza_margherita",
    titulo: "Pizza Margherita",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
    ],
    ganho: [{ nome: "pizza", quantidade: 1 }],
  },
  {
    id: "lasagna",
    titulo: "Lasanha à Bolonhesa",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "carne", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "molho", quantidade: 1 },
    ],
    ganho: [{ nome: "lasanha", quantidade: 1 }],
  },
  {
    id: "pasta_sauce",
    titulo: "Macarrão com Molho",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "molho", quantidade: 1 },
    ],
    ganho: [{ nome: "macarrão", quantidade: 1 }],
  },
  {
    id: "chicken_pie",
    titulo: "Torta de Frango",
    texto: "",
    custo: [
      { nome: "massa folhada", quantidade: 1 },
      { nome: "carne", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "torta", quantidade: 1 }],
  },
  // Nova receita
  {
    id: "beef_strogonoff",
    titulo: "Strogonoff de Carne",
    texto: "",
    custo: [
      { nome: "carne", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
      { nome: "cogumelo", quantidade: 1 },
    ],
    ganho: [{ nome: "strogonoff", quantidade: 1 }],
  },
  // Cartas de convite
  {
    id: "invite_elephant",
    titulo: "Convidar Elefante",
    texto: "",
    custo: [],
    ganho: [{ nome: "elefante", quantidade: 1 }],
  },
  {
    id: "invite_monkey",
    titulo: "Convidar Macaco",
    texto: "",
    custo: [],
    ganho: [{ nome: "macaco", quantidade: 1 }],
  },
  // Contratos
  {
    id: "serve_strogonoff_elephant",
    titulo: "Servir Strogonoff ao Elefante",
    texto: "",
    custo: [
      { nome: "elefante", quantidade: 1 },
      { nome: "strogonoff", quantidade: 1 },
    ],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "serve_banana_monkey",
    titulo: "Dar Banana ao Macaco",
    texto: "",
    custo: [
      { nome: "macaco", quantidade: 1 },
      { nome: "banana", quantidade: 1 },
    ],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
];

// ==================== ESTADO INICIAL AJUSTADO ====================
export const GAME_INITIAL_COOKING_V1 = {
  ...GAME_INITIAL,
  baralho: BARALHO_INICIAL_V1,
  baralhoDaOferta: BARALHO_OFERTA_INICIAL_V1,
  recursos: [
    ...GAME_INITIAL.recursos,
    { nome: "creme de leite", quantidade: 0 },
    { nome: "cogumelo", quantidade: 0 },
    { nome: "banana", quantidade: 0 },
    { nome: "elefante", quantidade: 0 },
    { nome: "macaco", quantidade: 0 },
  ],
};