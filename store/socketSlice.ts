// ============================ store/socketSlice.ts ============================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// actions/game.ts
// import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // Coup dans une partie Online (socket gère déjà les maj)
// export const playMoveOnline =
//   (move: { from: string; to: string }) =>
//   (dispatch, getState, { socket }) => {
//     const { game } = getState().game;
//     socket.emit('playMove', { gameId: game._id, move });
//   };

// // Coup contre IA
// export const playMoveVsAI = createAsyncThunk(
//   'game/playMoveVsAI',
//   async (move: { from: string; to: string }, { getState, dispatch }) => {
//     const { game } = getState().game;
//     // 1. Envoyer le coup utilisateur
//     const res = await axios.post(`http://localhost:3000/api/games/${game._id}/move`, move);
//     dispatch(updateGame(res.data)); // appliquer le coup utilisateur

//     // 2. Récupérer le coup IA
//     const res2 = await axios.get(`http://localhost:3000/api/games/${game._id}`);
//     dispatch(updateGame(res2.data)); // appliquer coup IA
//   }
// );

const slice = createSlice({
  name: 'socket',
  initialState: { connected: false, socketId: undefined as string | undefined },
  reducers: {
    setConnected: (s, a: PayloadAction<boolean>) => {
      s.connected = a.payload;
    },
    setDisconnected: (s) => {
      s.connected = false;
      s.socketId = undefined;
    },
    setSocketId: (s, a: PayloadAction<string | undefined>) => {
      s.socketId = a.payload;
    },
  },
});
export const { setConnected, setDisconnected, setSocketId } = slice.actions;
export default slice.reducer;
