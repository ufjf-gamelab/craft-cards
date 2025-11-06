import localforage from 'localforage';
import { GameType } from './data/cartas';

// Configure localForage
localforage.config({
  name: 'card-game',
  version: 1.0,
  storeName: 'game_data',
});

const GAME_STORAGE_KEY = 'gameState';

export const saveGameState = async (gameState: GameType): Promise<void> => {
  try {
    const { ...stateToSave } = gameState;
    await localforage.setItem(GAME_STORAGE_KEY, stateToSave);
    console.log('Game state saved successfully');
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = async (): Promise<GameType | null> => {
  try {
    const savedState = await localforage.getItem(GAME_STORAGE_KEY);
    if (savedState) {
      console.log('Game state loaded successfully');
    }
    return savedState as GameType;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = async (): Promise<void> => {
  try {
    await localforage.removeItem(GAME_STORAGE_KEY);
    console.log('Game state cleared');
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};