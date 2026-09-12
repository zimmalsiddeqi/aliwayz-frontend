import { io } from 'socket.io-client';
import { getAccessToken } from '@api/axios.instance';

export function getCleanSocketUrl() {
  let url = import.meta.env.VITE_SOCKET_URL || 'https://aliwayz-backend-production-1899.up.railway.app';
  // Strip any trailing /api/v1 or /api or trailing slash that may be mistakenly configured
  url = url.replace(/\/api(\/v\d+)?\/?$/i, '').replace(/\/+$/, '');
  return url;
}

let socketInstance = null;
let connectionAttempts = 0;

export function getSocket(token = null) {
  const authToken = token || getAccessToken();

  // If already connected and valid, return existing
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // If exists and currently in the process of connecting, do not interrupt
  if (socketInstance && !socketInstance.disconnected) {
    return socketInstance;
  }

  // If exists but disconnected, try reconnecting with token
  if (socketInstance && socketInstance.disconnected && authToken) {
    console.log('[REALTIME_DEBUG] socket reconnecting with auth token');
    socketInstance.auth = { token: authToken };
    socketInstance.connect();
    return socketInstance;
  }

  // Need new connection
  if (!authToken) return null;

  // Disconnect old socket if exists
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  connectionAttempts = 0;
  const socketUrl = getCleanSocketUrl();
  console.log('[REALTIME_DEBUG] socket creating with URL:', socketUrl);

  socketInstance = io(socketUrl, {
    auth:                  { token: authToken },
    transports:            ['polling', 'websocket'],
    reconnection:          true,
    reconnectionAttempts:  15,
    reconnectionDelay:     1000,
    reconnectionDelayMax:  5000,
    timeout:               20000,
    autoConnect:           true,
    forceNew:              false,
  });

  console.log('[REALTIME_DEBUG] socket connecting...');

  // Connection events for debugging
  socketInstance.on('connect', () => {
    connectionAttempts = 0;
    console.log(`[REALTIME_DEBUG] socket connected id=${socketInstance.id}`);
  });

  socketInstance.on('disconnect', (reason) => {
    console.warn(`[REALTIME_DEBUG] socket disconnected reason=${reason}`);
    // Auto-reconnect for server disconnects
    if (reason === 'io server disconnect') {
      socketInstance.connect();
    }
  });

  socketInstance.on('connect_error', (err) => {
    connectionAttempts++;
    console.warn(`[REALTIME_DEBUG] socket connection_error (attempt ${connectionAttempts}):`, err.message);
  });

  socketInstance.on('reconnect', (attempt) => {
    console.log(`[REALTIME_DEBUG] socket reconnected after ${attempt} attempts id=${socketInstance.id}`);
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function getSocketInstance() {
  return socketInstance;
}

export function isSocketConnected() {
  return socketInstance?.connected || false;
}

// Socket event constants matching backend exactly
export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_CONVERSATION:  'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE:       'send_message',
  TYPING_START:       'typing_start',
  TYPING_STOP:        'typing_stop',
  MARK_READ:          'mark_read',
  PING_PRESENCE:      'ping_presence',

  // Server → Client
  MESSAGE_RECEIVED:   'message_received',
  MESSAGE_SENT:       'message_sent',
  MESSAGE_ERROR:      'message_error',
  USER_TYPING:        'user_typing',
  USER_STOP_TYPING:   'user_stop_typing',
  MESSAGES_READ:      'messages_read',
  QR_SCANNED:         'qr_scanned',
  QR_GENERATED:       'qr_generated',
  USER_ONLINE:        'user_online',
  USER_OFFLINE:       'user_offline',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT:   'participant_left',
  JOINED_CONVERSATION:'joined_conversation',
  CONNECT:            'connect',
  DISCONNECT:         'disconnect',
  CONNECT_ERROR:      'connect_error',
  ERROR:              'error',
};