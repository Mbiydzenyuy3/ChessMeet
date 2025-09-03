import { configureStore } from '@reduxjs/toolkit';
import aiReducer from './slices/aiSlice';
import authReducer from './slices/authSlice';
// import gameReducer from './slices/gameSlice';
// import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // game: gameReducer,
    ai: aiReducer,
    // socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Because socket.io events are not serializable
    }),
});

// Types for dispatch and selector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
