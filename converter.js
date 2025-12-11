import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const RECIPES_DIR = './src/data/recipe';
const TAGS_DIR = './src/data/tags';
const OUTPUT_FILE = './src/data/minecraft_cards.ts';

// Carrega todas as tags
function loadTags() {
  const tags = new Map();
  
  function loadDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        loadDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const tagData = JSON.parse(content);
          const relativePath = path.relative(TAGS_DIR, fullPath);
          const tagName = `#${relativePath.replace(/\\/g, '/').replace('.json', '')}`;
          
          if (tagData.values && Array.isArray(tagData.values)) {
            const items = tagData.values.map(item => {
              if (typeof item === 'string') {
                return item.replace('minecraft:', '');
              } else if (item.tag) {
                return `#${item.tag.replace('minecraft:', '')}`;
              }
              return item;
            }).filter(Boolean);
            
            tags.set(tagName, items);
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    }
  }
  
  loadDir(TAGS_DIR);
  return tags;
}

// Formata nome do item
function formatItemName(itemName) {
  if (itemName.startsWith('#')) {
    return itemName.substring(1).split('/').pop().replace(/_/g, ' ') + ' (tag)';
  }
  return itemName.replace(/_/g, ' ');
}

// Processa um ingrediente
function processIngredient(ingredient, tags) {
  // Se for array (alternativas), pega o primeiro
  if (Array.isArray(ingredient)) {
    // Para simplificar, pega o primeiro item do array
    ingredient = ingredient[0];
    if (!ingredient) return null;
  }

  if (typeof ingredient === 'string') {
    const itemName = ingredient.replace('minecraft:', '');
    return {
      nome: formatItemName(itemName),
      quantidade: 1
    };
  } else if (ingredient.item) {
    const itemName = ingredient.item.replace('minecraft:', '');
    return {
      nome: formatItemName(itemName),
      quantidade: ingredient.count || 1
    };
  } else if (ingredient.tag) {
    const tagName = `#${ingredient.tag.replace('minecraft:', '')}`;
    return {
      nome: formatItemName(tagName),
      quantidade: ingredient.count || 1
    };
  }
  return null;
}

// Extrai resultado
function extractResult(result) {
  if (!result) return null;
  
  if (typeof result === 'string') {
    const itemName = result.replace('minecraft:', '');
    return {
      nome: formatItemName(itemName),
      quantidade: 1
    };
  } else if (result.item) {
    const itemName = result.item.replace('minecraft:', '');
    return {
      nome: formatItemName(itemName),
      quantidade: result.count || 1
    };
  } else if (result.id) { // Algumas receitas usam 'id' em vez de 'item'
    const itemName = result.id.replace('minecraft:', '');
    return {
      nome: formatItemName(itemName),
      quantidade: result.count || 1
    };
  }
  return null;
}

// Processa receita de crafting
function processCraftingRecipe(recipeData, fileName, tags) {
  const cards = [];
  
  // Receitas com padrão (shaped)
  if (recipeData.pattern && recipeData.key) {
    const pattern = recipeData.pattern;
    const key = recipeData.key;
    const result = recipeData.result;
    
    if (!result) return cards;
    
    const resultado = extractResult(result);
    if (!resultado) return cards;
    
    const custo = [];
    const flatPattern = pattern.join('');
    const charCount = {};
    
    for (const char of flatPattern) {
      if (char !== ' ') {
        charCount[char] = (charCount[char] || 0) + 1;
      }
    }
    
    for (const [char, count] of Object.entries(charCount)) {
      const ingredientDef = key[char];
      if (!ingredientDef) continue;
      
      // ingredientDef pode ser um objeto ou array
      const processed = processIngredient(ingredientDef, tags);
      if (processed) {
        custo.push({
          nome: processed.nome,
          quantidade: processed.quantidade * count
        });
      }
    }
    
    if (custo.length > 0) {
      cards.push({
        id: `mc_${createHash('md5').update(fileName).digest('hex').substring(0, 8)}`,
        titulo: `Craft ${resultado.nome}`,
        texto: `Minecraft recipe for ${resultado.nome}`,
        custo: custo,
        ganho: [resultado]
      });
    }
  }
  // Receitas sem padrão (shapeless)
  else if (recipeData.ingredients) {
    const result = recipeData.result;
    if (!result) return cards;
    
    const resultado = extractResult(result);
    if (!resultado) return cards;
    
    const custo = [];
    const ingredients = recipeData.ingredients;
    
    for (const ingredient of ingredients) {
      const processed = processIngredient(ingredient, tags);
      if (processed) {
        custo.push(processed);
      }
    }
    
    if (custo.length > 0) {
      cards.push({
        id: `mc_${createHash('md5').update(fileName + '_shapeless').digest('hex').substring(0, 8)}`,
        titulo: `Craft ${resultado.nome}`,
        texto: `Minecraft shapeless recipe for ${resultado.nome}`,
        custo: custo,
        ganho: [resultado]
      });
    }
  }
  
  return cards;
}

// Processa receitas de fornalha, alto-forno, etc.
function processCookingRecipe(recipeData, fileName, tags, type) {
  const cards = [];
  
  if (!recipeData.ingredient || !recipeData.result) return cards;
  
  const ingredient = processIngredient(recipeData.ingredient, tags);
  const result = recipeData.result;
  
  if (!ingredient || !result) return cards;
  
  const resultado = extractResult(result);
  if (!resultado) return cards;
  
  const typeNames = {
    'smelting': 'Smelt',
    'blasting': 'Blast',
    'campfire_cooking': 'Campfire Cook',
    'smoking': 'Smoke'
  };
  
  cards.push({
    id: `mc_${type}_${createHash('md5').update(fileName).digest('hex').substring(0, 8)}`,
    titulo: `${typeNames[type] || 'Process'} ${ingredient.nome}`,
    texto: `Minecraft ${type} recipe`,
    custo: [{ nome: ingredient.nome, quantidade: ingredient.quantidade }],
    ganho: [resultado]
  });
  
  return cards;
}

// Processa stonecutting
function processStonecuttingRecipe(recipeData, fileName, tags) {
  const cards = [];
  
  if (!recipeData.ingredient || !recipeData.result) return cards;
  
  const ingredient = processIngredient(recipeData.ingredient, tags);
  const result = recipeData.result;
  
  if (!ingredient || !result) return cards;
  
  const resultado = extractResult(result);
  if (!resultado) return cards;
  
  cards.push({
    id: `mc_cutting_${createHash('md5').update(fileName).digest('hex').substring(0, 8)}`,
    titulo: `Cut ${ingredient.nome}`,
    texto: `Minecraft stonecutting recipe`,
    custo: [{ nome: ingredient.nome, quantidade: 1 }],
    ganho: [resultado]
  });
  
  return cards;
}

// Lê todas as receitas
function readAllRecipes() {
  const recipes = [];
  
  function readDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        readDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const recipeData = JSON.parse(content);
          recipes.push({
            path: fullPath,
            name: entry.name,
            data: recipeData,
            relativePath: path.relative(RECIPES_DIR, fullPath)
          });
        } catch (error) {
          // Ignorar erros
        }
      }
    }
  }
  
  readDir(RECIPES_DIR);
  return recipes;
}

// Função principal
async function convertRecipes() {
  console.log('Loading tags...');
  const tags = loadTags();
  console.log(`Loaded ${tags.size} tags`);
  
  console.log('Loading recipes...');
  const allRecipes = readAllRecipes();
  console.log(`Found ${allRecipes.length} recipes`);
  
  const allCards = [];
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const recipe of allRecipes) {
    try {
      const recipeType = recipe.data.type || 'minecraft:crafting_shaped';
      let cards = [];
      
      // Normalizar o tipo removendo o namespace
      const normalizedType = recipeType.replace('minecraft:', '');
      
      switch (normalizedType) {
        case 'crafting_shaped':
          cards = processCraftingRecipe(recipe.data, recipe.relativePath, tags);
          break;
          
        case 'crafting_shapeless':
          cards = processCraftingRecipe(recipe.data, recipe.relativePath, tags);
          break;
          
        case 'smelting':
          cards = processCookingRecipe(recipe.data, recipe.relativePath, tags, 'smelting');
          break;
          
        case 'blasting':
          cards = processCookingRecipe(recipe.data, recipe.relativePath, tags, 'blasting');
          break;
          
        case 'campfire_cooking':
          cards = processCookingRecipe(recipe.data, recipe.relativePath, tags, 'campfire_cooking');
          break;
          
        case 'smoking':
          cards = processCookingRecipe(recipe.data, recipe.relativePath, tags, 'smoking');
          break;
          
        case 'stonecutting':
          cards = processStonecuttingRecipe(recipe.data, recipe.relativePath, tags);
          break;
          
        default:
          // Ignorar outros tipos
          skippedCount++;
          continue;
      }
      
      if (cards.length > 0) {
        allCards.push(...cards);
        processedCount++;
      } else {
        skippedCount++;
      }
      
    } catch (error) {
      console.error(`Error processing ${recipe.name}:`, error.message);
      skippedCount++;
    }
  }
  
  console.log(`\nProcessed ${processedCount} recipes, skipped ${skippedCount}`);
  console.log(`Generated ${allCards.length} cards`);
  
  const tsContent = `// Generated from Minecraft recipes
// Total cards: ${allCards.length}

import { CartaType } from "./cartas";

export const MINECRAFT_CARDS: CartaType[] = ${JSON.stringify(allCards, null, 2)};
`;

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`Saved to: ${OUTPUT_FILE}`);
  
  if (allCards.length > 0) {
    console.log('\nSample cards:');
    allCards.slice(0, 3).forEach((card, index) => {
      console.log(`${index + 1}. ${card.titulo}`);
      console.log(`   Cost: ${card.custo.map(c => `${c.quantidade}x ${c.nome}`).join(', ')}`);
      console.log(`   Gain: ${card.ganho.map(g => `${g.quantidade}x ${g.nome}`).join(', ')}`);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  convertRecipes().catch(console.error);
}