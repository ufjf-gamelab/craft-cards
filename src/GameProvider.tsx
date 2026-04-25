import { useReducer } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  logHistory,
  setupNewGame,
} from "./Game";
import { GAME_EX5 } from "./games/examples/simple-deck-v5.ts";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const logHistoryReducer = logHistory(gameReducer);

  const [game, dispatch] = useReducer(
    logHistoryReducer,
    setupNewGame(GAME_EX5)
  );

  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}