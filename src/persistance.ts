import localforage from 'localforage';
import { GameType } from './data/cartas';

// Configure localForage
localforage.config({
  name: 'card-game',
  version: 1.0,
  storeName: 'game_data',
});

const GAME_STORAGE_KEY = 'gameState';

export async function saveGameState(gameState: GameType): Promise<void> {
  try {
    const { ...stateToSave } = gameState;
    await localforage.setItem(GAME_STORAGE_KEY, stateToSave);
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

export async function loadGameState(): Promise<GameType | null> {
  try {
    const savedState = await localforage.getItem(GAME_STORAGE_KEY);
    if (savedState) {
    }
    return savedState as GameType;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await localforage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}

export function saveGameToFile(gameState: GameType): void {
  // Remove propriedades que não podem ser serializadas
  const { resourceGraph, ...stateToSave } = gameState;
  
  const dataStr = JSON.stringify(stateToSave, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `card-game-save-${new Date().toISOString().slice(0, 19)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadGameFromFile(file: File): Promise<GameType | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const gameState = JSON.parse(content) as GameType;
        resolve(gameState);
      } catch (error) {
        console.error('Error parsing game file:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}