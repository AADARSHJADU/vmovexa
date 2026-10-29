/**
 * socket.js — singleton Socket.IO client for the real-time layer.
 * Backend authenticates the handshake via a JWT passed in `auth.token`
 * (see backend/src/realtime/index.js). On connect the server auto-joins the
 * user's `org:<id>` room (and `platform` for platform roles), so tenant users
 * receive `vehicle:position` events for their whole org without extra subscribe.
 *
 * Base URL: strip the `/api/v1` suffix from VITE_API_URL to get the socket host.
 */
import { io } from 'socket.io-client';
import { storage } from '../utils/storage';

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'one.vmovexa.com') {
    return window.location.origin;
  }
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000`;
};

const SOCKET_URL = getSocketUrl();

let socket = null;

/** Returns the shared socket instance, creating (and connecting) it on first use. */
export function getSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    path: '/socket.io',
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: (cb) => cb({ token: storage.getAccessToken() }),
  });
  return socket;
}

/** Fully tears down the socket (call on logout). */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;
