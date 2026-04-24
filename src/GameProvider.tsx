import { useReducer } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  logHistory,
  setupNewGame,
} from "./Game";
import { GAME_EX1 } from "./games/examples/simple-deck-v1";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const logHistoryReducer = logHistory(gameReducer);

  const [game, dispatch] = useReducer(
    logHistoryReducer,
    setupNewGame(GAME_EX1)
  );

  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}