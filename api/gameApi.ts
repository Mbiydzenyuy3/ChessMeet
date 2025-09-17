// api/gameApi.ts
import { api } from '../lib/api';

export const gameApi = {
  startGame: (mode: 'ai' | 'multiplayer', opponentId?: string) =>
    api.post('/game/start', { mode, opponentId }),

  makeMove: (gameId: string, move: string) => api.post(`/game/${gameId}/move`, { move }),

  resign: (gameId: string) => api.post(`/game/${gameId}/resign`),

  getGameState: (gameId: string) => api.get(`/game/${gameId}`),

  getGameHistory: (gameId: string) => api.get(`/game/${gameId}/history`),
};
