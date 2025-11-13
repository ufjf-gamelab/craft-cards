import localforage from 'localforage';
import { GameType } from './data/cartas';

localforage.config({
  name: 'card-game',
  version: 1.0,
  storeName: 'game_data',
});

const GAME_STORAGE_KEY = 'gameState';

export async function saveGameState(gameState: GameType): Promise<void> {
  try {
    const { resourceGraph, ...stateToSave } = gameState;
    await localforage.setItem(GAME_STORAGE_KEY, stateToSave);
  } catch (error) {
    // Error 
  }
}

export async function loadGameState(): Promise<GameType | null> {
  try {
    const savedState = await localforage.getItem(GAME_STORAGE_KEY);
    return savedState as GameType;
  } catch (error) {
    // Error
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await localforage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    // Error 
  }
}

export function saveGameToFile(gameState: GameType): void {
  try {
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
  } catch (error) {
    // Error 
  }
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
        // 
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      // 
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}