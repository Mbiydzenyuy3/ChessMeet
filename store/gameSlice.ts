/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================ store/gameSlice.ts ============================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../lib/api';

export type Suggestion = { move: string; score?: number; reason?: string };
export type MoveObj = { from: string; to: string; promotion?: string; san?: string; fen?: string };

export type GameState = {
  currentId?: string;
  fen: string;
  pgn?: string;
  moves: MoveObj[];
  lastEvent?: string;
  assistantEnabled: boolean;
  suggestions: Suggestion[];
  loading: boolean;
  mode?: 'online' | 'ai';
};

const initialState: GameState = {
  fen: '',
  moves: [],
  suggestions: [],
  assistantEnabled: true,
  loading: false,
};

export const createVsAI = createAsyncThunk('game/createVsAI', async (timeControl?: string) => {
  const { data } = await api.post('/games/create-vs-ai', { timeControl });
  return data as any;
});

export const listGames = createAsyncThunk('game/list', async () => {
  const { data } = await api.get('/games/list');
  return data as any[];
});

export const resignGame = createAsyncThunk('game/resign', async (gameId: string) => {
  const { data } = await api.post(`/games/${gameId}/resign`, {});
  return data as { message: string };
});

/** GET du game complet (utilisé après un coup utilisateur vs IA pour récupérer le coup IA). */
export const fetchGameById = createAsyncThunk('game/fetchById', async (gameId: string) => {
  const { data } = await api.get(`/games/${gameId}`);
  return data as any;
});

/**
 * Joue un coup contre l'IA: POST /games/move renvoie l'état avec SEULEMENT le coup du joueur,
 * puis GET /api/games/:id renvoie l'état final (coup IA inclus).
 */
export const playMoveVsAI = createAsyncThunk(
  'game/playMoveVsAI',
  async ({ gameId, from, to }: { gameId: string; from: string; to: string }, { dispatch }) => {
    // 1) appliquer le coup utilisateur via HTTP
    const move = `${from}${to}`; // UCI ou SAN accepté côté backend
    const res = await api.post('/games/move', { gameId, move });
    const gameAfterUser = res.data;
    dispatch(updateFromGameObject(gameAfterUser));

    // 2) récupérer l'état avec le coup IA
    const res2 = await api.get(`/games/${gameId}`);
    dispatch(updateFromGameObject(res2.data));

    return res2.data;
  }
);

const slice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameSnapshot: (s, a: PayloadAction<{ id: string; fen: string; pgn?: string }>) => {
      s.currentId = a.payload.id;
      s.fen = a.payload.fen;
      s.pgn = a.payload.pgn;
    },
    appendMove: (s, a: PayloadAction<MoveObj>) => {
      s.moves.push(a.payload);
    },
    setSuggestions: (s, a: PayloadAction<Suggestion[]>) => {
      s.suggestions = a.payload;
    },
    toggleAssistant: (s) => {
      s.assistantEnabled = !s.assistantEnabled;
    },
    setLoading: (s, a: PayloadAction<boolean>) => {
      s.loading = a.payload;
    },
    setMode: (s, a: PayloadAction<'online' | 'ai' | undefined>) => {
      s.mode = a.payload;
    },
    /**
     * Mise à jour pratique quand le backend renvoie l'objet game complet
     */
    updateFromGameObject: (s, a: PayloadAction<any>) => {
      const g = a.payload || {};
      s.currentId = g._id ?? s.currentId;
      if (g.fen) s.fen = g.fen;
      if (g.pgn !== undefined) s.pgn = g.pgn;
      // Optionnel: si le backend renvoie l'historique, on peut le refléter ici
      if (Array.isArray(g.moves)) {
        s.moves = g.moves.map((m: any) => ({
          from: m.from,
          to: m.to,
          san: m.san,
          fen: m.fen,
          promotion: m.promotion,
        }));
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(createVsAI.pending, (s) => {
      s.loading = true;
    });
    b.addCase(createVsAI.fulfilled, (s, a) => {
      s.loading = false;
      s.currentId = a.payload._id;
      s.fen = a.payload.fen;
      s.pgn = a.payload.pgn;
      s.moves = [];
      s.suggestions = [];
      s.mode = 'ai';
    });
    b.addCase(createVsAI.rejected, (s) => {
      s.loading = false;
    });

    b.addCase(fetchGameById.fulfilled, (s, a) => {
      // sécurité: si on fait un GET isolé
      const g = a.payload;
      s.currentId = g._id ?? s.currentId;
      if (g.fen) s.fen = g.fen;
      if (g.pgn !== undefined) s.pgn = g.pgn;
    });
  },
});

export const {
  setGameSnapshot,
  appendMove,
  setSuggestions,
  toggleAssistant,
  setLoading,
  setMode,
  updateFromGameObject,
} = slice.actions;
export default slice.reducer;
