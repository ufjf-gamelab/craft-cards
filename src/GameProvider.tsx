import { useReducer } from "react";
import {
  GameDispatchContext,
  gameReducer,
  GameReducerContext,
  logHistory,
} from "./Game";
import { GAME_INITIAL } from "./data/cartas";

type GameProviderProps = {
  children: React.ReactNode;
};

export default function GameProvider({ children }: GameProviderProps) {
  const logHistoryReducer = logHistory(gameReducer);

  // Estado inicial vazio - será preenchido após carregar do storage
  const [game, dispatch] = useReducer(logHistoryReducer, GAME_INITIAL);


  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameReducerContext.Provider>
  );
}