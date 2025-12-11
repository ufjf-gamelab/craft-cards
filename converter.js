import fs from 'fs';
import path from 'path';

const RECIPES_DIR = './src/data/recipe';
const TAGS_DIR = './src/data/tags';
const OUTPUT_FILE = './src/data/minecraft_data.json';

function readAllJSONFiles(dir) {
  const result = {};
  
  function readDir(currentDir, baseKey = '') {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        readDir(fullPath, path.join(baseKey, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const jsonData = JSON.parse(content);
          
          const relativePath = path.relative(dir, fullPath);
          const key = relativePath.replace(/\\/g, '/').replace('.json', '');
          
          result[key] = jsonData;
        } catch (error) {
          console.warn(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  readDir(dir);
  return result;
}

function combineAllData() {
  console.log('Reading tags...');
  const tags = readAllJSONFiles(TAGS_DIR);
  console.log(`Read ${Object.keys(tags).length} tag files`);
  
  console.log('Reading recipes...');
  const recipes = readAllJSONFiles(RECIPES_DIR);
  console.log(`Read ${Object.keys(recipes).length} recipe files`);
  
  const combinedData = {
    tags,
    recipes,
    metadata: {
      totalTags: Object.keys(tags).length,
      totalRecipes: Object.keys(recipes).length,
      generatedAt: new Date().toISOString()
    }
  };
  
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedData, null, 2));
  console.log(`\nSaved combined data to: ${OUTPUT_FILE}`);
}

// Executar
combineAllData();