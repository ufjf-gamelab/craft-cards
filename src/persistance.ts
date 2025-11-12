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