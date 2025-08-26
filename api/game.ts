// // // src/api/game.ts
// // import api from './api'; // your Axios instance

// // export async function joinAIGame(timeControl: string) {
// //   try {
// //     const response = await api.post('/matchmaking/join', { timeControl });
// //     // backend returns the game object
// //     return response.data;
// //   } catch (err: any) {
// //     console.error('Error joining AI game:', err.response?.data || err.message);
// //     throw err;
// //   }
// // }

// // export async function playMove(gameId: string, move: string, promotion?: string) {
// //   try {
// //     const response = await api.post(`/game/move`, {
// //       gameId,
// //       move,
// //       promotion,
// //     });
// //     // backend returns the updated game object
// //     return response.data;
// //   } catch (err: any) {
// //     console.error('Error playing move:', err.response?.data || err.message);
// //     throw err;
// //   }
// // }

import api from './api';

export interface AIJoinResponse {
  gameId: string;
  fen: string;
  color: 'white' | 'black';
}

export interface MoveResponse {
  fen: string;
  move: string;
  winner?: string;
  isGameOver?: boolean;
}

export const joinAIGame = async (): Promise<AIJoinResponse> => {
  const { data } = await api.post('/game/ai');
  return data;
};

export const playMove = async (gameId: string, move: string): Promise<MoveResponse> => {
  const { data } = await api.post('/game/move', { gameId, move });
  return data;
};
