import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socketInstance = null;
let connectionAttempts = 0;

export function getSocket(token = null) {
  // If already connected and valid, return existing
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // If exists but disconnected, try reconnecting
  if (socketInstance && !socketInstance.connected && token) {
    socketInstance.auth = { token };
    socketInstance.connect();
    return socketInstance;
  }

  // Need new connection
  if (!token) return null;

  // Disconnect old socket if exists
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  connectionAttempts = 0;

  socketInstance = io(SOCKET_URL, {
    auth:                  { token },
    transports:            ['websocket', 'polling'],
    reconnection:          true,
    reconnectionAttempts:  10,
    reconnectionDelay:     1000,
    reconnectionDelayMax:  5000,
    timeout:               15000,
    autoConnect:           true,
    forceNew:              false,
  });

  // Connection events for debugging
  socketInstance.on('connect', () => {
    connectionAttempts = 0;
    console.info('[Socket] ✅ Connected:', socketInstance.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.warn('[Socket] ❌ Disconnected:', reason);
    // Auto-reconnect for these reasons
    if (reason === 'io server disconnect') {
      socketInstance.connect();
    }
  });

  socketInstance.on('connect_error', (err) => {
    connectionAttempts++;
    console.warn(`[Socket] Connection error (attempt ${connectionAttempts}):`, err.message);
  });

  socketInstance.on('reconnect', (attempt) => {
    console.info(`[Socket] ✅ Reconnected after ${attempt} attempts`);
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