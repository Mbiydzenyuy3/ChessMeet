import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Move {
  from: string;
  to: string;
  san: string; // Standard Algebraic Notation
}

interface GameState {
  mode: 'AI' | 'MULTIPLAYER' | null;
  fen: string; // Board state
  moves: Move[];
  status: 'WAITING' | 'IN_PROGRESS' | 'CHECKMATE' | 'DRAW' | null;
}

const initialState: GameState = {
  mode: null,
  fen: 'start',
  moves: [],
  status: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameMode(state, action: PayloadAction<'AI' | 'MULTIPLAYER'>) {
      state.mode = action.payload;
    },
    updateBoard(state, action: PayloadAction<string>) {
      state.fen = action.payload;
    },
    addMove(state, action: PayloadAction<Move>) {
      state.moves.push(action.payload);
    },
    setGameStatus(state, action: PayloadAction<GameState['status']>) {
      state.status = action.payload;
    },
    resetGame(state) {
      state.fen = 'start';
      state.moves = [];
      state.status = null;
    },
  },
});

export const { setGameMode, updateBoard, addMove, setGameStatus, resetGame } = gameSlice.actions;

export default gameSlice.reducer;
