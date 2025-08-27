// src/socket/io.ts
import { API_BASE_URL } from '@/constants/config';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io(API_BASE_URL.socketUrl, {
      auth: { token }, // token is optional if your backend WS guard needs it
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not connected!');
  return socket;
};
