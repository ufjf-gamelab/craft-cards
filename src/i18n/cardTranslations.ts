type Lang = "en" | "pt";

const resourceDict: Record<string, Record<Lang, string>> = {
  "action": { en: "Action", pt: "Ação" },
  "score": { en: "Score", pt: "Pontuação" },
  "raw wood": { en: "Raw Wood", pt: "Madeira Bruta" },
  "wood": { en: "Wood", pt: "Madeira" },
  "raw stone": { en: "Raw Stone", pt: "Pedra Bruta" },
  "stone": { en: "Stone", pt: "Pedra" },
  "polished stone": { en: "Polished Stone", pt: "Pedra Polida" },
  "plank": { en: "Plank", pt: "Tábua" },
  "water": { en: "Water", pt: "Água" },
  "blackberry": { en: "Blackberry", pt: "Amora" },
  "axe": { en: "Axe", pt: "Machado" },
  "pickaxe": { en: "Pickaxe", pt: "Picareta" },
  "gold": { en: "Gold", pt: "Ouro" },
  "blade": { en: "Blade", pt: "Lâmina" },
  "infinite resource": { en: "Infinite Resource", pt: "Recurso Infinito" },
  "reagent": { en: "Reagent", pt: "Reagente" },
  "catalyst": { en: "Catalyst", pt: "Catalisador" },

  // Cooking
  "flour": { en: "Flour", pt: "Farinha" },
  "tomato": { en: "Tomato", pt: "Tomate" },
  "cheese": { en: "Cheese", pt: "Queijo" },
  "meat": { en: "Meat", pt: "Carne" },
  "vegetable": { en: "Vegetable", pt: "Vegetal" },
  "egg": { en: "Egg", pt: "Ovo" },
  "milk": { en: "Milk", pt: "Leite" },
  "cream": { en: "Cream", pt: "Creme de Leite" },
  "mushroom": { en: "Mushroom", pt: "Cogumelo" },
  "banana": { en: "Banana", pt: "Banana" },
  "dough": { en: "Dough", pt: "Massa" },
  "sauce": { en: "Sauce", pt: "Molho" },
  "puff pastry": { en: "Puff Pastry", pt: "Massa Folhada" },
  "liquid batter": { en: "Liquid Batter", pt: "Massa Líquida" },
  "pizza": { en: "Pizza", pt: "Pizza" },
  "lasagna": { en: "Lasagna", pt: "Lasanha" },
  "pasta": { en: "Pasta", pt: "Macarrão" },
  "pie": { en: "Pie", pt: "Torta" },
  "souffle": { en: "Souffle", pt: "Soufflé" },
  "stroganoff": { en: "Stroganoff", pt: "Strogonoff" },
  "omelet": { en: "Omelet", pt: "Omelete" },
  "cake": { en: "Cake", pt: "Bolo" },
  "cheese bread": { en: "Cheese Bread", pt: "Pão de Queijo" },
  "soup": { en: "Soup", pt: "Sopa" },
  "mushroom cream": { en: "Mushroom Cream", pt: "Creme de Cogumelo" },
};

const cardDict: Record<
  string,
  Record<Lang, { titulo: string; texto: string }>
> = {
  // simple-deck-v1
  make_stone: {
    en: { titulo: "Collect Stone", texto: "" },
    pt: { titulo: "Coletar Pedra", texto: "" },
  },
  // simple-deck-v3
  mine: { en: { titulo: "Ore", texto: "" }, pt: { titulo: "Minério", texto: "" } },
  sword: { en: { titulo: "Sword", texto: "" }, pt: { titulo: "Espada", texto: "" } },
  shield: { en: { titulo: "Shield", texto: "" }, pt: { titulo: "Escudo", texto: "" } },
  helmet: { en: { titulo: "Helmet", texto: "" }, pt: { titulo: "Capacete", texto: "" } },
  // simple-deck-v5
  wood: { en: { titulo: "Collect Wood", texto: "" }, pt: { titulo: "Coletar Madeira", texto: "" } },
  plank: { en: { titulo: "Saw", texto: "" }, pt: { titulo: "Serra", texto: "" } },
  stone: { en: { titulo: "Collect Stone", texto: "" }, pt: { titulo: "Coletar Pedra", texto: "" } },
  blade: { en: { titulo: "Forge Blade", texto: "" }, pt: { titulo: "Forjar Lâmina", texto: "" } },
  // simple-deck-v6
  consume_x: {
    en: { titulo: "Consume X", texto: "Costs 1 X, produces nothing." },
    pt: { titulo: "Consumir X", texto: "Custa 1 X, não produz nada." },
  },
  consume_y: {
    en: { titulo: "Consume Y", texto: "Costs 1 Y, produces nothing." },
    pt: { titulo: "Consumir Y", texto: "Custa 1 Y, não produz nada." },
  },
  trade_x_for_y: {
    en: { titulo: "Trade X for Y", texto: "Costs 1 X, produces 1 Y." },
    pt: { titulo: "Trocar X por Y", texto: "Custa 1 X, produz 1 Y." },
  },
  trade_y_for_x: {
    en: { titulo: "Trade Y for X", texto: "Costs 1 Y, produces 1 X." },
    pt: { titulo: "Trocar Y por X", texto: "Custa 1 Y, produz 1 X." },
  },
  // simple-deck-v7
  produce_infinite: {
    en: { titulo: "Produce Infinitely", texto: "Produces resources infinitely" },
    pt: { titulo: "Produzir Infinito", texto: "Produz recursos infinitamente" },
  },
  // simple-deck-v8
  prepare: {
    en: { titulo: "Prepare", texto: "Prepares the reagent" },
    pt: { titulo: "Preparar", texto: "Prepara o reagente" },
  },
  synthesize: {
    en: { titulo: "Synthesize", texto: "Reagent + Catalyst → Score" },
    pt: { titulo: "Sintetizar", texto: "Reagente + Catalisador → Pontos" },
  },
  // cartas.ts default deck
  m1: { en: { titulo: "Collect Wood", texto: "" }, pt: { titulo: "Pegar Madeira", texto: "" } },
  a1: { en: { titulo: "Collect Water", texto: "" }, pt: { titulo: "Pegar Água", texto: "" } },
  pa1: { en: { titulo: "Collect Blackberry", texto: "" }, pt: { titulo: "Pegar Amora", texto: "" } },
  p1: { en: { titulo: "Collect Stone", texto: "" }, pt: { titulo: "Pegar Pedra", texto: "" } },
  m2: { en: { titulo: "Collect Wood", texto: "" }, pt: { titulo: "Pegar Madeira", texto: "" } },
  a3: { en: { titulo: "Collect Water", texto: "" }, pt: { titulo: "Pegar Água", texto: "" } },
  pa3: { en: { titulo: "Collect Blackberry", texto: "" }, pt: { titulo: "Pegar Amora", texto: "" } },
  p3: { en: { titulo: "Collect Stone", texto: "" }, pt: { titulo: "Pegar Pedra", texto: "" } },
  b2: { en: { titulo: "Drink Water", texto: "" }, pt: { titulo: "Beber Água", texto: "" } },
  c2: { en: { titulo: "Eat Blackberry", texto: "" }, pt: { titulo: "Comer Amora", texto: "" } },
  s1: { en: { titulo: "Basic Sawmill", texto: "" }, pt: { titulo: "Serralheria Básica", texto: "" } },
  pb1: { en: { titulo: "Basic Quarry", texto: "" }, pt: { titulo: "Pedreira Básica", texto: "" } },
  f1: { en: { titulo: "Craft Axe", texto: "" }, pt: { titulo: "Fabricar Machado", texto: "" } },
  f2: { en: { titulo: "Craft Pickaxe", texto: "" }, pt: { titulo: "Fabricar Picareta", texto: "" } },
  a2: { en: { titulo: "Collect Water", texto: "" }, pt: { titulo: "Pegar Água", texto: "" } },
  b1: { en: { titulo: "Drink Water", texto: "" }, pt: { titulo: "Beber Água", texto: "" } },
  c1: { en: { titulo: "Eat Blackberry", texto: "" }, pt: { titulo: "Comer Amora", texto: "" } },
  p2: { en: { titulo: "Collect Stone", texto: "" }, pt: { titulo: "Pegar Pedra", texto: "" } },
  pa2: { en: { titulo: "Collect Blackberry", texto: "" }, pt: { titulo: "Pegar Amora", texto: "" } },
  m3: { en: { titulo: "Collect Wood", texto: "" }, pt: { titulo: "Pegar Madeira", texto: "" } },
};

function toLang(lang: string): Lang {
  return lang.startsWith("pt") ? "pt" : "en";
}

export function translateResource(nome: string, lang: string): string {
  const entry = resourceDict[nome];
  if (!entry) return nome;
  return entry[toLang(lang)];
}

export function translateCardTitulo(
  id: string,
  fallback: string,
  lang: string
): string {
  const entry = cardDict[id];
  if (!entry) return fallback;
  return entry[toLang(lang)].titulo;
}

export function translateCardTexto(
  id: string,
  fallback: string,
  lang: string
): string {
  const entry = cardDict[id];
  if (!entry) return fallback;
  return entry[toLang(lang)].texto;
}

export function isCardCustomized(card: { id: string; titulo: string }): boolean {
  const entry = cardDict[card.id];
  if (!entry) return true;
  return card.titulo !== entry.en.titulo;
}

export function translateCardTituloSmart(
  card: { id: string; titulo: string },
  lang: string
): string {
  if (isCardCustomized(card)) return card.titulo;
  return translateCardTitulo(card.id, card.titulo, lang);
}

export function translateCardTextoSmart(
  card: { id: string; texto: string },
  lang: string
): string {
  const entry = cardDict[card.id];
  if (!entry || card.texto !== entry.en.texto) return card.texto;
  return translateCardTexto(card.id, card.texto, lang);
}