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
    });
    b.addCase(createVsAI.rejected, (s) => {
      s.loading = false;
    });
  },
});

export const { setGameSnapshot, appendMove, setSuggestions, toggleAssistant, setLoading } =
  slice.actions;
export default slice.reducer;
