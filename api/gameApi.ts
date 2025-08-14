// api/gameApi.ts
import axiosClient from './axiosClient';

export const gameApi = {
  startGame: (mode: 'ai' | 'multiplayer', opponentId?: string) =>
    axiosClient.post('/game/start', { mode, opponentId }),

  makeMove: (gameId: string, move: string) => axiosClient.post(`/game/${gameId}/move`, { move }),

  resign: (gameId: string) => axiosClient.post(`/game/${gameId}/resign`),

  getGameState: (gameId: string) => axiosClient.get(`/game/${gameId}`),

  getGameHistory: (gameId: string) => axiosClient.get(`/game/${gameId}/history`),
};
