// src/games/cooking/cards-cooking-animal-v2.ts

import { CartaType, GAME_INITIAL } from "../../data/cartas";

// ==================== BARALHO INICIAL DO JOGADOR ====================
export const BARALHO_INICIAL_V2: CartaType[] = [
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
  // Novos ingredientes
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

  // ---------- Processados ----------
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
  // ---------- Novas receitas ----------
  {
    id: "omelete",
    titulo: "Omelete",
    texto: "",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "omelete", quantidade: 1 }],
  },
  {
    id: "banana_cake",
    titulo: "Bolo de Banana",
    texto: "",
    custo: [
      { nome: "banana", quantidade: 1 },
      { nome: "farinha", quantidade: 1 },
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
    ],
    ganho: [{ nome: "bolo", quantidade: 1 }],
  },
  {
    id: "cheese_bread",
    titulo: "Pão de Queijo",
    texto: "",
    custo: [
      { nome: "farinha", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "ovo", quantidade: 1 },
    ],
    ganho: [{ nome: "pao_queijo", quantidade: 1 }],
  },
  {
    id: "vegetable_soup",
    titulo: "Sopa de Legumes",
    texto: "",
    custo: [
      { nome: "vegetal", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
    ],
    ganho: [{ nome: "sopa", quantidade: 1 }],
  },
  {
    id: "mushroom_cream",
    titulo: "Creme de Cogumelo",
    texto: "",
    custo: [
      { nome: "cogumelo", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "creme_cogumelo", quantidade: 1 }],
  },

  // ---------- Contratos (diretos) ----------
  {
    id: "elephant_contract",
    titulo: "Elefante faminto",
    texto: "-1 strogonoff, +3 pontos",
    custo: [{ nome: "strogonoff", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "monkey_contract",
    titulo: "Macaco guloso",
    texto: "-1 banana, +3 pontos",
    custo: [{ nome: "banana", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "lion_contract",
    titulo: "Leão faminto",
    texto: "-1 lasanha, +3 pontos",
    custo: [{ nome: "lasanha", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "bear_contract",
    titulo: "Urso glutão",
    texto: "-1 torta, +3 pontos",
    custo: [{ nome: "torta", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "pig_contract",
    titulo: "Porco esfomeado",
    texto: "-1 macarrão, +2 pontos",
    custo: [{ nome: "macarrão", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "bird_contract",
    titulo: "Pássaro delicado",
    texto: "-1 soufflé, +4 pontos",
    custo: [{ nome: "soufflé", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 4 }],
  },
  {
    id: "cat_contract",
    titulo: "Gato gourmet",
    texto: "-1 pizza, +2 pontos",
    custo: [{ nome: "pizza", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "frog_contract",
    titulo: "Sapo Gourmet",
    texto: "-1 omelete, +2 pontos",
    custo: [{ nome: "omelete", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "rabbit_contract",
    titulo: "Coelho Doce",
    texto: "-1 bolo, +4 pontos",
    custo: [{ nome: "bolo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 4 }],
  },
  {
    id: "mouse_contract",
    titulo: "Rato Aventureiro",
    texto: "-1 pão de queijo, +3 pontos",
    custo: [{ nome: "pao_queijo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "turtle_contract",
    titulo: "Tartaruga Sábia",
    texto: "-1 sopa, +2 pontos",
    custo: [{ nome: "sopa", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "snail_contract",
    titulo: "Caracol Delicado",
    texto: "-1 creme de cogumelo, +3 pontos",
    custo: [{ nome: "creme_cogumelo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "fox_contract",
    titulo: "Raposa Esperta",
    texto: "-1 pizza, +3 pontos",
    custo: [{ nome: "pizza", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },

  // ---------- Cartas com múltiplos ganhos (variação) ----------
  {
    id: "basic_basket",
    titulo: "Cesta Básica",
    texto: "-1 ovo, -1 leite, +1 farinha, +1 tomate, +1 queijo",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
    ],
    ganho: [
      { nome: "farinha", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
    ],
  },
  {
    id: "butcher",
    titulo: "Açougueiro",
    texto: "-2 vegetal, +1 carne",
    custo: [{ nome: "vegetal", quantidade: 2 }],
    ganho: [{ nome: "carne", quantidade: 1 }],
  },
  {
    id: "dairy",
    titulo: "Laticínios",
    texto: "-2 leite, +1 queijo, +1 creme de leite",
    custo: [{ nome: "leite", quantidade: 2 }],
    ganho: [
      { nome: "queijo", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
    ],
  },
];

// ==================== BARALHO DA OFERTA (IDs com prefixo "offer_") ====================
export const BARALHO_OFERTA_INICIAL_V2: CartaType[] = [
  // Ingredientes básicos
  {
    id: "offer_gather_flour",
    titulo: "Coletar Farinha",
    texto: "",
    custo: [],
    ganho: [{ nome: "farinha", quantidade: 1 }],
  },
  {
    id: "offer_gather_tomato",
    titulo: "Coletar Tomate",
    texto: "",
    custo: [],
    ganho: [{ nome: "tomate", quantidade: 1 }],
  },
  {
    id: "offer_gather_cheese",
    titulo: "Coletar Queijo",
    texto: "",
    custo: [],
    ganho: [{ nome: "queijo", quantidade: 1 }],
  },
  {
    id: "offer_gather_meat",
    titulo: "Coletar Carne",
    texto: "",
    custo: [],
    ganho: [{ nome: "carne", quantidade: 1 }],
  },
  {
    id: "offer_gather_cream",
    titulo: "Coletar Creme de Leite",
    texto: "",
    custo: [],
    ganho: [{ nome: "creme de leite", quantidade: 1 }],
  },
  {
    id: "offer_gather_mushroom",
    titulo: "Coletar Cogumelo",
    texto: "",
    custo: [],
    ganho: [{ nome: "cogumelo", quantidade: 1 }],
  },
  {
    id: "offer_gather_banana",
    titulo: "Coletar Banana",
    texto: "",
    custo: [],
    ganho: [{ nome: "banana", quantidade: 1 }],
  },
  // Processados
  {
    id: "offer_knead",
    titulo: "Amassar",
    texto: "",
    custo: [{ nome: "farinha", quantidade: 1 }],
    ganho: [{ nome: "massa", quantidade: 1 }],
  },
  {
    id: "offer_make_sauce",
    titulo: "Fazer Molho",
    texto: "",
    custo: [
      { nome: "tomate", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "molho", quantidade: 1 }],
  },
  // Receitas tradicionais
  {
    id: "offer_pizza_margherita",
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
    id: "offer_lasagna",
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
    id: "offer_pasta_sauce",
    titulo: "Macarrão com Molho",
    texto: "",
    custo: [
      { nome: "massa", quantidade: 1 },
      { nome: "molho", quantidade: 1 },
    ],
    ganho: [{ nome: "macarrão", quantidade: 1 }],
  },
  {
    id: "offer_chicken_pie",
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
    id: "offer_beef_strogonoff",
    titulo: "Strogonoff de Carne",
    texto: "",
    custo: [
      { nome: "carne", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
      { nome: "cogumelo", quantidade: 1 },
    ],
    ganho: [{ nome: "strogonoff", quantidade: 1 }],
  },
  // Novas receitas
  {
    id: "offer_omelete",
    titulo: "Omelete",
    texto: "",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "omelete", quantidade: 1 }],
  },
  {
    id: "offer_banana_cake",
    titulo: "Bolo de Banana",
    texto: "",
    custo: [
      { nome: "banana", quantidade: 1 },
      { nome: "farinha", quantidade: 1 },
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
    ],
    ganho: [{ nome: "bolo", quantidade: 1 }],
  },
  {
    id: "offer_cheese_bread",
    titulo: "Pão de Queijo",
    texto: "",
    custo: [
      { nome: "farinha", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
      { nome: "ovo", quantidade: 1 },
    ],
    ganho: [{ nome: "pao_queijo", quantidade: 1 }],
  },
  {
    id: "offer_vegetable_soup",
    titulo: "Sopa de Legumes",
    texto: "",
    custo: [
      { nome: "vegetal", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
    ],
    ganho: [{ nome: "sopa", quantidade: 1 }],
  },
  {
    id: "offer_mushroom_cream",
    titulo: "Creme de Cogumelo",
    texto: "",
    custo: [
      { nome: "cogumelo", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
      { nome: "vegetal", quantidade: 1 },
    ],
    ganho: [{ nome: "creme_cogumelo", quantidade: 1 }],
  },
  // Contratos
  {
    id: "offer_elephant_contract",
    titulo: "Elefante faminto",
    texto: "-1 strogonoff, +3 pontos",
    custo: [{ nome: "strogonoff", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_monkey_contract",
    titulo: "Macaco guloso",
    texto: "-1 banana, +3 pontos",
    custo: [{ nome: "banana", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_lion_contract",
    titulo: "Leão faminto",
    texto: "-1 lasanha, +3 pontos",
    custo: [{ nome: "lasanha", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_bear_contract",
    titulo: "Urso glutão",
    texto: "-1 torta, +3 pontos",
    custo: [{ nome: "torta", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_pig_contract",
    titulo: "Porco esfomeado",
    texto: "-1 macarrão, +2 pontos",
    custo: [{ nome: "macarrão", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "offer_bird_contract",
    titulo: "Pássaro delicado",
    texto: "-1 soufflé, +4 pontos",
    custo: [{ nome: "soufflé", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 4 }],
  },
  {
    id: "offer_cat_contract",
    titulo: "Gato gourmet",
    texto: "-1 pizza, +2 pontos",
    custo: [{ nome: "pizza", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "offer_frog_contract",
    titulo: "Sapo Gourmet",
    texto: "-1 omelete, +2 pontos",
    custo: [{ nome: "omelete", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "offer_rabbit_contract",
    titulo: "Coelho Doce",
    texto: "-1 bolo, +4 pontos",
    custo: [{ nome: "bolo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 4 }],
  },
  {
    id: "offer_mouse_contract",
    titulo: "Rato Aventureiro",
    texto: "-1 pão de queijo, +3 pontos",
    custo: [{ nome: "pao_queijo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_turtle_contract",
    titulo: "Tartaruga Sábia",
    texto: "-1 sopa, +2 pontos",
    custo: [{ nome: "sopa", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 2 }],
  },
  {
    id: "offer_snail_contract",
    titulo: "Caracol Delicado",
    texto: "-1 creme de cogumelo, +3 pontos",
    custo: [{ nome: "creme_cogumelo", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  {
    id: "offer_fox_contract",
    titulo: "Raposa Esperta",
    texto: "-1 pizza, +3 pontos",
    custo: [{ nome: "pizza", quantidade: 1 }],
    ganho: [{ nome: "pontos", quantidade: 3 }],
  },
  // Cartas com múltiplos ganhos
  {
    id: "offer_basic_basket",
    titulo: "Cesta Básica",
    texto: "-1 ovo, -1 leite, +1 farinha, +1 tomate, +1 queijo",
    custo: [
      { nome: "ovo", quantidade: 1 },
      { nome: "leite", quantidade: 1 },
    ],
    ganho: [
      { nome: "farinha", quantidade: 1 },
      { nome: "tomate", quantidade: 1 },
      { nome: "queijo", quantidade: 1 },
    ],
  },
  {
    id: "offer_butcher",
    titulo: "Açougueiro",
    texto: "-2 vegetal, +1 carne",
    custo: [{ nome: "vegetal", quantidade: 2 }],
    ganho: [{ nome: "carne", quantidade: 1 }],
  },
  {
    id: "offer_dairy",
    titulo: "Laticínios",
    texto: "-2 leite, +1 queijo, +1 creme de leite",
    custo: [{ nome: "leite", quantidade: 2 }],
    ganho: [
      { nome: "queijo", quantidade: 1 },
      { nome: "creme de leite", quantidade: 1 },
    ],
  },
];

// ==================== ESTADO INICIAL AJUSTADO ====================
export const GAME_INITIAL_COOKING_V2 = {
  ...GAME_INITIAL,
  baralho: BARALHO_INICIAL_V2,
  baralhoDaOferta: BARALHO_OFERTA_INICIAL_V2,
  recursos: [
    ...GAME_INITIAL.recursos,
  ],
};