import { useReducer } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  logHistory,
  setupNewGame,
} from "./Game";
import { GAME_INITIAL_COOKING_V2 } from "./games/cooking/cards-cooking-animal-v2";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const logHistoryReducer = logHistory(gameReducer);

  const [game, dispatch] = useReducer(
    logHistoryReducer,
    setupNewGame(GAME_INITIAL_COOKING_V2)
  );

  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}