// ============================ store/socketSlice.ts ============================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
