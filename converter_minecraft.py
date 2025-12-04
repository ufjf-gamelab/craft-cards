import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class Item:
    """Representa um item com nome e display name"""
    id: str  # ID interno (ex: "oak_planks")
    name: str  # Nome legível (ex: "Oak Planks")
    is_tag: bool = False

class ResourceMapper:
    """Mapeia itens do Minecraft para recursos simplificados"""
    
    def __init__(self):
        # Mapeamento de itens para recursos
        self.item_to_resource = {
            # Madeiras → recursos básicos
            **{f"{wood}_planks": "tabua" for wood in [
                "oak", "spruce", "birch", "jungle", "acacia", 
                "dark_oak", "mangrove", "cherry", "bamboo", 
                "crimson", "warped"
            ]},
            **{f"{wood}_log": "madeira bruta" for wood in [
                "oak", "spruce", "birch", "jungle", "acacia", 
                "dark_oak", "mangrove", "cherry"
            ]},
            **{f"stripped_{wood}_log": "madeira bruta" for wood in [
                "oak", "spruce", "birch", "jungle", "acacia",
                "dark_oak", "mangrove", "cherry"
            ]},
            
            # Pedras
            "cobblestone": "pedra bruta",
            "stone": "pedra polida",
            "andesite": "pedra bruta",
            "diorite": "pedra bruta",
            "granite": "pedra bruta",
            
            # Ferramentas
            "stick": "graveto",
            "wooden_pickaxe": "picareta",
            "stone_pickaxe": "picareta",
            "iron_pickaxe": "picareta",
            "wooden_axe": "machado",
            "stone_axe": "machado",
            "iron_axe": "machado",
            "wooden_shovel": "pá",
            "stone_shovel": "pá",
            "iron_shovel": "pá",
            "wooden_hoe": "enxada",
            "stone_hoe": "enxada",
            "iron_hoe": "enxada",
        }
        
        # Tags (grupos de itens)
        self.tag_to_resource = {
            "#minecraft:planks": "tabua",
            "#minecraft:logs": "madeira bruta",
            "#minecraft:stone_crafting_materials": "pedra bruta",
        }
        
        # Recursos permitidos no jogo
        self.allowed_resources = {
            "madeira bruta", "tabua", "graveto",
            "pedra bruta", "pedra polida",
            "machado", "picareta", "pá", "enxada"
        }
    
    def get_resource_name(self, item_id: str) -> Optional[str]:
        """Converte ID do item para nome de recurso"""
        # Remove namespace
        if item_id.startswith("minecraft:"):
            item_id = item_id[10:]
        
        # Verifica mapeamento direto
        if item_id in self.item_to_resource:
            return self.item_to_resource[item_id]
        
        # Verifica padrões comuns
        if item_id.endswith("_planks"):
            return "tabua"
        elif item_id.endswith("_log"):
            return "madeira bruta"
        elif "pickaxe" in item_id:
            return "picareta"
        elif "axe" in item_id:
            return "machado"
        elif "shovel" in item_id:
            return "pá"
        elif "hoe" in item_id:
            return "enxada"
        
        return None
    
    def is_allowed(self, resource_name: str) -> bool:
        """Verifica se o recurso é permitido no jogo"""
        return resource_name in self.allowed_resources
    
    def get_display_name(self, item_id: str) -> str:
        """Gera nome legível a partir do ID"""
        if item_id.startswith("minecraft:"):
            item_id = item_id[10:]
        
        # Substitui underscores por espaços e capitaliza
        words = item_id.split('_')
        return ' '.join(word.capitalize() for word in words)

class RecipeProcessor:
    """Processa receitas do Minecraft"""
    
    def __init__(self):
        self.mapper = ResourceMapper()
        self.processed_cards = []
    
    def parse_item(self, item_data: Any) -> Optional[Item]:
        """Extrai informações do item da receita"""
        if isinstance(item_data, str):
            return Item(id=item_data, name=self.mapper.get_display_name(item_data))
        
        if isinstance(item_data, dict):
            if "item" in item_data:
                item_id = item_data["item"]
                return Item(id=item_id, name=self.mapper.get_display_name(item_id))
            elif "tag" in item_data:
                tag = item_data["tag"]
                return Item(id=tag, name=f"Tag: {tag}", is_tag=True)
        
        return None
    
    def parse_result(self, result_data: Any) -> tuple[Optional[Item], int]:
        """Extrai resultado da receita"""
        if isinstance(result_data, str):
            return Item(id=result_data, name=self.mapper.get_display_name(result_data)), 1
        
        if isinstance(result_data, dict):
            item_id = result_data.get("item") or result_data.get("id", "unknown")
            count = result_data.get("count", 1)
            return Item(id=item_id, name=self.mapper.get_display_name(item_id)), count
        
        return None, 1
    
    def process_shaped_recipe(self, recipe: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Processa receita com formato específico"""
        pattern = recipe.get("pattern", [])
        key = recipe.get("key", {})
        
        # Conta ingredientes do pattern
        ingredient_counts = {}
        for row in pattern:
            for char in row:
                if char != ' ' and char in key:
                    ingredient = self.parse_item(key[char])
                    if ingredient:
                        resource = self.mapper.get_resource_name(ingredient.id)
                        if resource and self.mapper.is_allowed(resource):
                            ingredient_counts[resource] = ingredient_counts.get(resource, 0) + 1
        
        # Processa resultado
        result_item, result_count = self.parse_result(recipe.get("result", {}))
        if not result_item:
            return None
        
        result_resource = self.mapper.get_resource_name(result_item.id)
        if not result_resource or not self.mapper.is_allowed(result_resource):
            return None
        
        # Cria carta
        return {
            "titulo": f"Criar {result_item.name}",
            "id": f"craft_{result_item.id.replace(':', '_')}",
            "texto": recipe.get("group", "crafting"),
            "custo": [
                {"nome": res, "quantidade": qty}
                for res, qty in ingredient_counts.items()
            ],
            "ganho": [{"nome": result_resource, "quantidade": result_count}]
        }
    
    def process_shapeless_recipe(self, recipe: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Processa receita sem formato específico"""
        ingredients = recipe.get("ingredients", [])
        
        # Conta ingredientes
        ingredient_counts = {}
        for ingredient_data in ingredients:
            ingredient = self.parse_item(ingredient_data)
            if ingredient:
                resource = self.mapper.get_resource_name(ingredient.id)
                if resource and self.mapper.is_allowed(resource):
                    ingredient_counts[resource] = ingredient_counts.get(resource, 0) + 1
        
        # Processa resultado
        result_item, result_count = self.parse_result(recipe.get("result", {}))
        if not result_item:
            return None
        
        result_resource = self.mapper.get_resource_name(result_item.id)
        if not result_resource or not self.mapper.is_allowed(result_resource):
            return None
        
        # Cria carta
        return {
            "titulo": f"Criar {result_item.name}",
            "id": f"shapeless_{result_item.id.replace(':', '_')}",
            "texto": recipe.get("group", "crafting"),
            "custo": [
                {"nome": res, "quantidade": qty}
                for res, qty in ingredient_counts.items()
            ],
            "ganho": [{"nome": result_resource, "quantidade": result_count}]
        }
    
    def process_recipe_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Processa um arquivo de receita"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                recipe = json.load(f)
        except Exception as e:
            print(f"Erro ao ler {file_path.name}: {e}")
            return []
        
        # Determina tipo da receita
        recipe_type = recipe.get("type", "")
        
        if recipe_type == "minecraft:crafting_shaped":
            card = self.process_shaped_recipe(recipe)
        elif recipe_type == "minecraft:crafting_shapeless":
            card = self.process_shapeless_recipe(recipe)
        else:
            return []  # Ignora outros tipos por enquanto
        
        return [card] if card and card["custo"] else []
    
    def filter_cards(self, cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filtra cartas mantendo apenas as mais simples"""
        filtered = []
        
        for card in cards:
            # Pula cartas com título duplicado
            if card["titulo"] in [c["titulo"] for c in filtered]:
                continue
            
            # Conta ingredientes diferentes e total
            different_ingredients = len(card["custo"])
            total_items = sum(item["quantidade"] for item in card["custo"])
            
            # Mantém apenas cartas simples
            if different_ingredients <= 4 and total_items <= 8:
                filtered.append(card)
        
        return filtered
    
    def generate_typescript(self, cards: List[Dict[str, Any]]) -> str:
        """Gera código TypeScript das cartas"""
        # Ordena por simplicidade
        cards.sort(key=lambda c: (len(c['custo']), sum(i['quantidade'] for i in c['custo'])))
        
        ts = """import { CartaType } from "./cartas";

// Cartas do Minecraft simplificadas
export const MINECRAFT_CARDS: Array<CartaType> = [
"""
        
        for i, card in enumerate(cards):
            ts += f""" {{
    id: "minecraft_{card['id']}",
    titulo: "{card['titulo']}",
    texto: "{card['texto']}",
    custo: [
"""
            for cost in sorted(card["custo"], key=lambda x: x["nome"]):
                ts += f"      {{ nome: \"{cost['nome']}\", quantidade: {cost['quantidade']} }},\n"
            
            ts += """    ],
    ganho: [
"""
            for gain in card["ganho"]:
                ts += f"      {{ nome: \"{gain['nome']}\", quantidade: {gain['quantidade']} }},\n"
            
            ts += """    ],
  }""" + ("," if i < len(cards) - 1 else "") + "\n"
        
            ts += "\n"

        # Lista recursos únicos
        resources = set()
        for card in cards:
            for cost in card["custo"]:
                resources.add(cost["nome"])
            for gain in card["ganho"]:
                resources.add(gain["nome"])
        
        if resources:
            ts += f"""
// Recursos usados nas cartas
export const RECURSOS_MINECRAFT: Array<string> = [
"""
            for resource in sorted(resources):
                ts += f'  "{resource}",\n'
            ts += "];\n"
        
        return ts
    

def main():
    """Função principal"""
    processor = RecipeProcessor()
    
    # Configuração
    input_folder = Path("./src/data/recipe")
    output_file = Path("./src/data/minecraft_cards.ts")
    
    if not input_folder.exists():
        print(f"Erro: Pasta '{input_folder}' não encontrada!")
        return
    
    # Processa todas as receitas
    print("Processando receitas do Minecraft...")
    all_cards = []
    
    for file_path in input_folder.glob("*.json"):
        cards = processor.process_recipe_file(file_path)
        all_cards.extend(cards)
    
    print(f"Total de cartas encontradas: {len(all_cards)}")
    
    # Filtra cartas
    filtered_cards = processor.filter_cards(all_cards)
    print(f"Cartas após filtro: {len(filtered_cards)}")
    
    if not filtered_cards:
        print("Nenhuma carta válida encontrada!")
        return
    
    # Gera arquivo TypeScript
    ts_code = processor.generate_typescript(filtered_cards)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"Arquivo gerado: {output_file}")

if __name__ == "__main__":
    main()