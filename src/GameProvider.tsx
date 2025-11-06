import { useReducer, useEffect, useState } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  setupNewGame,
  logHistory,
  GameActions,
} from "./Game";
import { GAME_INITIAL, GameType } from "./data/cartas";
import { loadGameState, saveGameState } from "./persistance";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const logHistoryReducer = logHistory(gameReducer);

  // Estado inicial vazio - será preenchido após carregar do storage
  const [game, dispatch] = useReducer(logHistoryReducer, GAME_INITIAL);

  // Carregar o jogo salvo quando o componente montar
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const savedGame = await loadGameState();
        
        if (savedGame) {
          console.log('🎮 Jogo salvo encontrado, carregando...', {
            mao: savedGame.mao.length,
            emJogo: savedGame.emJogo.length,
            recursos: savedGame.recursos.length
          });
          
          // Dispatch para carregar o jogo salvo
          dispatch({
            type: GameActions.LOAD_GAME,
            payload: {
              ...savedGame,
              resourceGraph: undefined, // Não carregamos o graph
              analisesVisiveis: savedGame.analisesVisiveis || false,
              activeTab: savedGame.activeTab || "graph"
            }
          });
        } else {
          console.log('🆕 Nenhum jogo salvo encontrado, iniciando novo jogo...');
          // Inicia um novo jogo
          const newGame = setupNewGame(GAME_INITIAL);
          dispatch({
            type: GameActions.LOAD_GAME,
            payload: newGame
          });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar jogo:', error);
        // Em caso de erro, inicia um novo jogo
        const newGame = setupNewGame(GAME_INITIAL);
        dispatch({
          type: GameActions.LOAD_GAME,
          payload: newGame
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedGame();
  }, []);

  // Salvar automaticamente quando o jogo muda
  useEffect(() => {
    if (!isLoading && game && game.mao.length > 0) {
      console.log('💾 Salvando jogo...', {
        mao: game.mao.length,
        emJogo: game.emJogo.length
      });
      saveGameState(game);
    }
  }, [game, isLoading]);

  if (isLoading) {
    return <div className="loading">Carregando jogo...</div>;
  }

  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}