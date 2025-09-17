// api/aiApi.ts
import { api } from '../lib/api';

export const aiApi = {
  getMoveSuggestion: (gameId: string) => api.get(`/ai/${gameId}/suggestion`),

  getMoveExplanation: (gameId: string, move: string) =>
    api.post(`/ai/${gameId}/explanation`, { move }),
};
