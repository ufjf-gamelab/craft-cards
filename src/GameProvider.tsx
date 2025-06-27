import { useReducer } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  setupNewGame,
  logHistory,
} from "./Game";
import { GAME_INITIAL } from "./data/cartas";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const logHistoryReducer = logHistory(gameReducer); // adiciona o log de histórico ao reducer

  const [game, dispatch] = useReducer(logHistoryReducer, GAME_INITIAL, setupNewGame);
  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}
