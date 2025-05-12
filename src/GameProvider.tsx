import { useReducer } from "react";
import { GameDispatchContext, gameReducer, GameReducerContext, setupNewGame } from "./Game";
import { GAME_INITIAL } from "./data/cartas";

type GameProviderProps = {
  children: React.ReactNode;
}

export default function GameProvider({children}:GameProviderProps){
  const [game, dispatch] = useReducer(gameReducer, GAME_INITIAL, setupNewGame);
  return (
    <GameReducerContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
      </GameReducerContext.Provider>
  )
}