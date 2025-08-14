import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SocketState {
  connected: boolean;
  roomId: string | null;
}

const initialState: SocketState = {
  connected: false,
  roomId: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    connectSocket(state) {
      state.connected = true;
    },
    disconnectSocket(state) {
      state.connected = false;
      state.roomId = null;
    },
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
  },
});

export const { connectSocket, disconnectSocket, setRoomId } = socketSlice.actions;

export default socketSlice.reducer;
