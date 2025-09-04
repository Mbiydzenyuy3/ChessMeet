// ============================ hooks/useSocket.ts ============================
import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store';
import { ENV } from '../lib/env';
import { getToken } from '../lib/storage';
import { setConnected, setDisconnected, setSocketId } from '../store/socketSlice';

export function useSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const socket = useMemo(() => {
    console.log(`url backend du socked ${ENV.WS_URL}`);
    const s = io(ENV.WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: {
        token: token, // <-- ajoute ici
      },
    });

    return s;
  }, [token]);

  useEffect(() => {
    let mounted = true;
    async function connect() {
      const jwt = token || (await getToken());
      if (!jwt) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.io.opts.extraHeaders = { Authorization: `Bearer ${jwt}` } as any;
      socket.connect();
      console.log('connexion socket etablir');
    }
    connect();

    socket.on('connect', () => {
      if (!mounted) return;
      dispatch(setConnected(true));
      dispatch(setSocketId(socket.id));
    });
    socket.on('disconnect', () => mounted && dispatch(setDisconnected()));

    return () => {
      mounted = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  return socket;
}
