import fs from "fs";

// ─── 1. Lê o TS gerado pelo conversor anterior ───
// (você precisa ter rodado convert-minecraft.js antes)
const raw = fs.readFileSync("./src/data/minecraft_cards.ts", "utf8");

// Extrai o array MINECRAFT_CARDS via eval controlado
const arrayMatch = raw.match(/MINECRAFT_CARDS: CartaType\[\] = (\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.error("Não achei MINECRAFT_CARDS no arquivo.");
  process.exit(1);
}
const allCards = eval(arrayMatch[1]);

// ─── 2. Substitui tags por itens concretos ───
const TAG_REPLACEMENTS = {
  "#acacia_logs": "acacia_log",
  "#birch_logs": "birch_log",
  "#cherry_logs": "cherry_log",
  "#crimson_stems": "crimson_stem",
  "#dark_oak_logs": "dark_oak_log",
  "#jungle_logs": "jungle_log",
  "#mangrove_logs": "mangrove_log",
  "#oak_logs": "oak_log",
  "#pale_oak_logs": "pale_oak_log",
  "#spruce_logs": "spruce_log",
  "#warped_stems": "warped_stem",
  "#logs": "oak_log",
  "#logs_that_burn": "oak_log",
  "#planks": "oak_planks",
  "#wooden_slabs": "oak_slab",
  "#wooden_stairs": "oak_stairs",
  "#wooden_doors": "oak_door",
  "#wooden_fences": "oak_fence",
  "#wooden_buttons": "oak_button",
  "#wooden_pressure_plates": "oak_pressure_plate",
  "#wooden_trapdoors": "oak_trapdoor",
  "#wooden_tool_materials": "oak_planks",
  "#stone_crafting_materials": "cobblestone",
  "#stone_tool_materials": "cobblestone",
  "#diamond_tool_materials": "diamond",
  "#iron_tool_materials": "iron_ingot",
  "#gold_tool_materials": "gold_ingot",
  "#netherite_tool_materials": "netherite_ingot",
  "#coals": "coal",
  "#sand": "sand",
  "#wool": "white_wool",
  "#eggs": "egg",
  "#leaves": "oak_leaves",
  "#smelts_to_glass": "sand",
  "#soul_fire_base_blocks": "soul_sand",
  "#stone_buttons": "stone_button",
  "#stone_pressure_plates": "stone_pressure_plate",
  "#walls": "cobblestone_wall",
  "#anvil": "anvil",
  "#rails": "rail",
  "#shulker_boxes": "shulker_box",
  "#cauldrons": "cauldron",
  "#decorated_pot_sherds": "angler_pottery_sherd",
};

const resolveTag = (nome) => TAG_REPLACEMENTS[nome] || nome;

const cleanCards = allCards.map((card) => ({
  ...card,
  custo: card.custo.map((c) => ({ ...c, nome: resolveTag(c.nome) })),
  ganho: card.ganho.map((g) => ({ ...g, nome: resolveTag(g.nome) })),
}));

// ─── 3. Cartas de coleta ───
const collectionCards = [
  { id: "rest", titulo: "Rest", texto: "Regain one action.", custo: [], ganho: [{ nome: "acao", quantidade: 1 }] },
  { id: "gather_oak_log", titulo: "Gather Oak Log", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "oak_log", quantidade: 1 }] },
  { id: "gather_cobblestone", titulo: "Gather Cobblestone", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "cobblestone", quantidade: 2 }] },
  { id: "gather_coal", titulo: "Mine Coal", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "coal", quantidade: 1 }] },
  { id: "gather_iron_ore", titulo: "Mine Iron Ore", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "iron_ore", quantidade: 1 }] },
  { id: "gather_gold_ore", titulo: "Mine Gold Ore", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "gold_ore", quantidade: 1 }] },
  { id: "gather_diamond", titulo: "Mine Diamond", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "diamond", quantidade: 1 }] },
  { id: "gather_sand", titulo: "Gather Sand", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "sand", quantidade: 2 }] },
  { id: "gather_wheat", titulo: "Harvest Wheat", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "wheat", quantidade: 1 }] },
  { id: "gather_sugar_cane", titulo: "Harvest Sugar Cane", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "sugar_cane", quantidade: 1 }] },
  { id: "gather_cocoa_beans", titulo: "Harvest Cocoa Beans", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "cocoa_beans", quantidade: 1 }] },
  { id: "gather_leather", titulo: "Gather Leather", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "leather", quantidade: 1 }] },
  { id: "gather_egg", titulo: "Collect Egg", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "egg", quantidade: 1 }] },
  { id: "gather_apple", titulo: "Gather Apple", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "apple", quantidade: 1 }] },
  { id: "gather_carrot", titulo: "Harvest Carrot", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "carrot", quantidade: 1 }] },
  { id: "gather_flint", titulo: "Mine Flint", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "flint", quantidade: 1 }] },
  { id: "gather_feather", titulo: "Gather Feather", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "feather", quantidade: 1 }] },
  { id: "gather_string", titulo: "Gather String", texto: "", custo: [{ nome: "acao", quantidade: 1 }], ganho: [{ nome: "string", quantidade: 1 }] },
];

// ─── 4. Contratos (dão pontuação) ───
const contractCards = [
  { id: "wood_contract", titulo: "Wood Contract", texto: "Trade 4 Oak Planks for 1 point", custo: [{ nome: "oak_planks", quantidade: 4 }], ganho: [{ nome: "pontuacao", quantidade: 1 }] },
  { id: "stone_contract", titulo: "Stone Contract", texto: "Trade 4 Cobblestone for 1 point", custo: [{ nome: "cobblestone", quantidade: 4 }], ganho: [{ nome: "pontuacao", quantidade: 1 }] },
  { id: "coal_contract", titulo: "Coal Contract", texto: "Trade 4 Coal for 1 point", custo: [{ nome: "coal", quantidade: 4 }], ganho: [{ nome: "pontuacao", quantidade: 1 }] },
  { id: "iron_contract", titulo: "Iron Contract", texto: "Trade 2 Iron Ingots for 2 points", custo: [{ nome: "iron_ingot", quantidade: 2 }], ganho: [{ nome: "pontuacao", quantidade: 2 }] },
  { id: "gold_contract", titulo: "Gold Contract", texto: "Trade 2 Gold Ingots for 3 points", custo: [{ nome: "gold_ingot", quantidade: 2 }], ganho: [{ nome: "pontuacao", quantidade: 3 }] },
  { id: "diamond_contract", titulo: "Diamond Contract", texto: "Trade 1 Diamond for 5 points", custo: [{ nome: "diamond", quantidade: 1 }], ganho: [{ nome: "pontuacao", quantidade: 5 }] },
  { id: "diamond_block_contract", titulo: "Diamond Block Contract", texto: "Trade 1 Diamond Block for 10 points", custo: [{ nome: "diamond_block", quantidade: 1 }], ganho: [{ nome: "pontuacao", quantidade: 10 }] },
];

// ─── 5. Monta baralho e oferta ───
// Baralho = todas as receitas do baralho + coleta
// Oferta = contratos + receitas que exigem itens raros
const rareItems = new Set(["diamond", "diamond_block", "netherite_ingot", "nether_star", "beacon"]);

const ofertaCards = cleanCards.filter((c) =>
  c.custo.some((ing) => rareItems.has(ing.nome))
);
const baralhoCards = cleanCards.filter(
  (c) => !c.custo.some((ing) => rareItems.has(ing.nome))
);

// ─── 6. Coleta recursos únicos ───
const resourceSet = new Set(["pontuacao", "acao"]);
[...collectionCards, ...contractCards, ...baralhoCards, ...ofertaCards].forEach((c) => {
  c.custo.forEach((i) => resourceSet.add(i.nome));
  c.ganho.forEach((i) => resourceSet.add(i.nome));
});

const recursos = Array.from(resourceSet).map((nome) => ({
  nome,
  quantidade: nome === "pontuacao" ? 0 : nome === "acao" ? 5 : 0,
}));

// ─── 7. Monta JSON final ───
const final = {
  baralho: [...collectionCards, ...baralhoCards],
  baralhoDaOferta: [...contractCards, ...ofertaCards],
  recursos,
  pontosParaVencer: 20,
  turnosMaximos: 100,
};

fs.writeFileSync(
  "./minecraft-cards.json",
  JSON.stringify(final, null, 2)
);

console.log(`OK — ${final.baralho.length} cartas no baralho`);
console.log(`OK — ${final.baralhoDaOferta.length} cartas na oferta`);
console.log(`OK — ${recursos.length} recursos`);
console.log(`Salvo em ./minecraft-cards.json`);