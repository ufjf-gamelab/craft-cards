import localforage from 'localforage';
import { GameType } from './data/cartas';

localforage.config({
  name: 'card-game',
  version: 1.0,
  storeName: 'game_data',
});

const GAME_STORAGE_KEY = 'gameState';
const CURRENT_STORAGE_VERSION = 2; // Não esquecer de atualizar Current

// Interface para persistência
type VersionedGameState = {
  gameData: any;
  storageVersion: number;
}

function migrateV1ToV2(state: VersionedGameState): VersionedGameState {
  // Na v1, o estado era o GameType diretamente, não tinha a estrutura VersionedGameState
  if (!state.gameData && state.storageVersion === undefined) {
    return {
      gameData: {
        ...state,
        seed: (state as any).seed || Date.now()
      },
      storageVersion: 2
    };
  }
  
  // Caso já esteja no formato VersionedGameState
  return {
    gameData: {
      ...state.gameData,
      seed: state.gameData.seed || Date.now()
    },
    storageVersion: 2
  };
}

// Sistema de migrations:
const migrations: { [key: number]: (state: any) => VersionedGameState } = {
  1: migrateV1ToV2,
};

function detectVersion(state: any): number {
  if (state && typeof state === 'object') {
    if (state.storageVersion !== undefined) {
      return state.storageVersion;
    }
    // Se tem gameData mas não tem storageVersion, assume v1 com estrutura nova
    if (state.gameData !== undefined) {
      return 1;
    }
  }
  // Estado antigo sem versionamento - assume v1
  return 1;
}

// Aplica todas as migrations
function applyMigrations(state: any): VersionedGameState {
  const detectedVersion = detectVersion(state);
  
  let currentState: VersionedGameState;
  
  if (detectedVersion === 1 && state.gameData === undefined) {
    // Estado v1 sem estrutura VersionedGameState
    currentState = {
      gameData: state,
      storageVersion: 1
    };
  } else if (detectedVersion === 1 && state.gameData !== undefined) {
    currentState = state as VersionedGameState;
  } else {
    // Outras versões
    currentState = state as VersionedGameState;
  }
  
  // Aplica migrations sequenciais
  while (currentState.storageVersion < CURRENT_STORAGE_VERSION) {
    const migration = migrations[currentState.storageVersion];
    if (migration) {
      currentState = migration(currentState);
    } else {
      currentState.storageVersion++;
    }
  }
  
  return currentState;
}

export async function saveGameState(gameState: GameType): Promise<void> {
  try {
    const { resourceGraph, ...gameDataToSave } = gameState;
    
    const versionedState: VersionedGameState = {
      gameData: gameDataToSave,
      storageVersion: CURRENT_STORAGE_VERSION
    };
    
    await localforage.setItem(GAME_STORAGE_KEY, versionedState);
  } catch (error) {
    //Erro
  }
}

export async function loadGameState(): Promise<GameType | null> {
  try {
    const savedState = await localforage.getItem(GAME_STORAGE_KEY);
    
    if (!savedState) {
      return null;
    }
    const migratedState = applyMigrations(savedState);
    
    return migratedState.gameData as GameType;
  } catch (error) {
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await localforage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar estado:', error);
  }
}

export function saveGameToFile(gameState: GameType): void {
  try {
    const { resourceGraph, ...gameDataToSave } = gameState;
    
    const versionedState: VersionedGameState = {
      gameData: gameDataToSave,
      storageVersion: CURRENT_STORAGE_VERSION
    };
    
    const dataStr = JSON.stringify(versionedState, null, 2);
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
    console.error('Erro ao salvar jogo em arquivo:', error);
  }
}

export function loadGameFromFile(file: File): Promise<GameType | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const savedState = JSON.parse(content);
        const migratedState = applyMigrations(savedState);

        resolve(migratedState.gameData as GameType);
      } catch (error) {
        console.error('Erro ao carregar jogo do arquivo:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('Erro ao ler arquivo');
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}