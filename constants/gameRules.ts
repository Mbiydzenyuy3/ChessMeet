// constants/gameRules.ts

export const GAME_RULES = {
  timePerMove: 60, // in seconds
  maxPlayers: 2,
  maxMoveHistory: 200,

  // Game end reasons
  END_REASON: {
    CHECKMATE: 'checkmate',
    STALEMATE: 'stalemate',
    RESIGNATION: 'resignation',
    TIMEOUT: 'timeout',
    DRAW: 'draw',
  },
};
