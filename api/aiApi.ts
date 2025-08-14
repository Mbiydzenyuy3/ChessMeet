// api/aiApi.ts
import axiosClient from './axiosClient';

export const aiApi = {
  getMoveSuggestion: (gameId: string) => axiosClient.get(`/ai/${gameId}/suggestion`),

  getMoveExplanation: (gameId: string, move: string) =>
    axiosClient.post(`/ai/${gameId}/explanation`, { move }),
};
