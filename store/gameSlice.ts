/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================ store/gameSlice.ts ============================
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  turn?: string;
  whitePlayer?: string;
  blackPlayer?: string;
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
  console.log(`retour du gane vs ia ${JSON.stringify(data)}`);
  return data as any;
});

export const listGames = createAsyncThunk('game/list', async () => {
  const { data } = await api.get('/games/list');
  return data as any[];
});

export const resignGame = createAsyncThunk('game/resign', async (gameId: string) => {
  const { data } = await api.post(`/games/${gameId}/resign`, {});
  console.log(`data d'abandon ${JSON.stringify(data)}`);
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
    const move = `${from}${to}`;
    console.log(`🎯 Coup joueur envoyé: ${move}`);

    // 1) envoyer le coup joueur au backend
    await api.post('/games/move', { gameId, move });
    console.log(`✅ Coup ${move} appliqué côté backend, attente IA...`);

    // 2) récupérer directement l'état complet (après le coup IA)
    const res2 = await api.get(`/games/${gameId}`);
    console.log(`🤖 Réponse backend (IA incluse):`, res2.data);

    // 3) mettre à jour Redux avec l'état final (joueur + IA)
    dispatch(updateFromGameObject(res2.data));
    console.log(
      `📌 Store mis à jour avec FEN complet du coup du jouer et de l'ia: ${res2.data.fen}`
    );

    return res2.data;
  }
);
export const askSuggestions = createAsyncThunk(
  'game/askSuggestion',
  async ({ gameId }: { gameId: string }, { dispatch }) => {
    const { data } = await api.post(`/ai/suggest-moves`, { gameId });
    console.log('🎯 Réponse backend suggestion:', data);

    // Reformater en { move, reason } comme attendu par ton UI
    const suggestions = (data.suggestions || []).map((m: string, i: number) => ({
      move: m,
      reason: data.explanations?.[i],
    }));

    dispatch(setSuggestions(suggestions));
    return suggestions;
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
    setAssistantEnabled: (s, action: PayloadAction<boolean>) => {
      s.assistantEnabled = action.payload;
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
      console.log(`apple de la fomction pour update le state ${s}`);

      const g = a.payload || {};
      s.currentId = g._id ?? s.currentId;
      if (g.fen) s.fen = g.fen;
      if (g.pgn !== undefined) s.pgn = g.pgn;

      if (g.turn !== undefined) s.turn = g.turn;
      if (g.whitePlayer !== undefined) s.whitePlayer = g.whitePlayer;
      if (g.blackPlayer !== undefined) s.blackPlayer = g.blackPlayer;
      // Optionnel: si le backend renvoie l'historique, on peut le refléter ici
      // if (Array.isArray(g.moves)) {
      //   s.moves = g.moves.map((m: any) => ({
      //     from: m.from,
      //     to: m.to,
      //     san: m.san,
      //     fen: m.fen,
      //     promotion: m.promotion,
      //   }));
      // }
    },
    resetGame: (s) => {
      s.currentId = undefined;
      s.fen = '';
      s.pgn = undefined;
      s.moves = [];
      s.suggestions = [];
      s.assistantEnabled = true;
      s.loading = false;
      s.mode = undefined;
      s.turn = undefined;
      s.whitePlayer = undefined;
      s.blackPlayer = undefined;
      s.lastEvent = undefined;
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
      s.turn = a.payload.turn;
      //  récupération des joueurs
      s.whitePlayer = a.payload.whitePlayer;
      s.blackPlayer = a.payload.blackPlayer;
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
      // 👇 idem ici
      if (g.whitePlayer !== undefined) s.whitePlayer = g.whitePlayer;
      if (g.blackPlayer !== undefined) s.blackPlayer = g.blackPlayer;
    });
    //  Suggestions
    b.addCase(askSuggestions.pending, (s) => {
      s.loading = true;
      s.suggestions = []; // optionnel, si tu veux vider avant
    });
    b.addCase(askSuggestions.fulfilled, (s, a) => {
      s.loading = false;
      s.suggestions = a.payload; // suggestions déjà normalisées dans le thunk
    });
    b.addCase(askSuggestions.rejected, (s) => {
      s.loading = false;
      s.suggestions = [];
    });

    b.addCase(resignGame.fulfilled, (s) => {
      s.loading = false;
      s.lastEvent = 'resigned';

      // reset complet
      s.currentId = undefined;
      s.fen = '';
      s.pgn = undefined;
      s.moves = [];
      s.suggestions = [];
      s.mode = undefined;
      s.turn = undefined;
      s.whitePlayer = undefined;
      s.blackPlayer = undefined;
    });
  },
});

export const {
  setGameSnapshot,
  appendMove,
  setSuggestions,
  setAssistantEnabled,
  setLoading,
  setMode,
  updateFromGameObject,
} = slice.actions;
export default slice.reducer;
