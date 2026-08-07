import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Connect to same origin
    socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server with ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from real-time server.');
    });
  }

  return socket;
}
