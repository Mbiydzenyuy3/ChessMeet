// api/gameApi.ts
import axiosClient from './api';

export const gameApi = {
  startGame: (mode: 'ai' | 'multiplayer', opponentId?: string) =>
    axiosClient.post('/games/create-vs-ai', { mode, opponentId }),

  makeMove: (gameId: string, move: string) => axiosClient.post(`/games/${gameId}/move`, { move }),

  resign: (gameId: string) => axiosClient.post(`/games/${gameId}/resign`),

  getGameState: (gameId: string) => axiosClient.get(`/games/${gameId}`),

  getGameHistory: (gameId: string) => axiosClient.get(`/games/${gameId}/history`),

  getUserGameHistory: () => axiosClient.get('/games/history'),
};
