export const availableModels: Record<string, () => Promise<any>> = {
  "Cooking v1": () =>
    import("../games/cooking/cards-cooking-animal-v1").then(
      (m) => m.GAME_INITIAL_COOKING_V1,
    ),
  "Cooking v2": () =>
    import("../games/cooking/cards-cooking-animal-v2").then(
      (m) => m.GAME_INITIAL_COOKING_V2,
    ),
  "Simple v1 (básico)": () =>
    import("../games/examples/simple-deck-v1").then((m) => m.GAME_EX1),
  "Simple v3 (gargalo)": () =>
    import("../games/examples/simple-deck-v3").then((m) => m.GAME_EX3),
  "Simple v4 (ciclo)": () =>
    import("../games/examples/simple-deck-v4").then((m) => m.GAME_EX4),
  "Simple v5 (desconexo)": () =>
    import("../games/examples/simple-deck-v5").then((m) => m.GAME_EX5),
  "Simple v6 (deadlock)": () =>
    import("../games/examples/simple-deck-v6").then((m) => m.GAME_EX6),
  "Simple v7 (crescimento ω)": () =>
    import("../games/examples/simple-deck-v7").then((m) => m.GAME_EX7),
  "Simple v8 (pontos)": () =>
    import("../games/examples/simple-deck-v8").then((m) => m.GAME_EX8),
};
