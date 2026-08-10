import { useEffect, useRef, useCallback, useState } from 'react';
import {
  getSocket,
  SOCKET_EVENTS,
} from '@lib/socket';
import { getAccessToken } from '@api/axios.instance';
import useAuthStore from '@store/auth.store';
import useChatStore from '@store/chat.store';

export default function useConversationSocket(conversationId) {
  const { user, isAuthenticated } = useAuthStore();
  const {
    addMessage,
    markConversationRead,
    setTyping,
    getTypingUsers,
    setUserOnline,
    setUserOffline,
  } = useChatStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const typingTimeoutRef = useRef(null);
  const joinedRoomRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !isAuthenticated || !user?.id) return;

    const token = getAccessToken();
    const socket = getSocket(token);

    if (!socket) {
      console.warn('[useSocket] No socket available');
      return;
    }

    const joinRoom = (s) => {
      if (joinedRoomRef.current === conversationId) return;

      s.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
        conversationId,
      });
      s.emit(SOCKET_EVENTS.MARK_READ, { conversationId });
      markConversationRead(conversationId, user.id);
      joinedRoomRef.current = conversationId;
      setIsJoined(true);
    };

    if (socket.connected) {
      setIsConnected(true);
      joinRoom(socket);
    }

    const handleConnect = () => {
      setIsConnected(true);
      joinRoom(socket);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsJoined(false);
      joinedRoomRef.current = null;
    };

    const handleMessageReceived = (data) => {
      if (
        data.conversationId === conversationId &&
        data.message
      ) {
        addMessage(conversationId, data.message);
        socket.emit(SOCKET_EVENTS.MARK_READ, {
          conversationId,
        });
      }
    };

    const handleUserTyping = (data) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== user.id
      ) {
        setTyping(conversationId, data.userId, true);
        setTimeout(() => {
          setTyping(conversationId, data.userId, false);
        }, 3000);
      }
    };

    const handleUserStopTyping = (data) => {
      if (
        data.conversationId === conversationId &&
        data.userId !== user.id
      ) {
        setTyping(conversationId, data.userId, false);
      }
    };

    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        markConversationRead(conversationId, data.readBy);
      }
    };

    const handleUserOnline = (data) => {
      if (data.userId) setUserOnline(data.userId);
    };

    const handleUserOffline = (data) => {
      if (data.userId) setUserOffline(data.userId);
    };

    const handleJoined = () => {
      setIsJoined(true);
    };

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    socket.on(
      SOCKET_EVENTS.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(
      SOCKET_EVENTS.USER_STOP_TYPING,
      handleUserStopTyping
    );
    socket.on(
      SOCKET_EVENTS.MESSAGES_READ,
      handleMessagesRead
    );
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    socket.on(
      SOCKET_EVENTS.JOINED_CONVERSATION,
      handleJoined
    );

    return () => {
      if (
        socket &&
        joinedRoomRef.current === conversationId
      ) {
        socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, {
          conversationId,
        });
        joinedRoomRef.current = null;
        setIsJoined(false);
      }

      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(
        SOCKET_EVENTS.DISCONNECT,
        handleDisconnect
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_RECEIVED,
        handleMessageReceived
      );
      socket.off(
        SOCKET_EVENTS.USER_TYPING,
        handleUserTyping
      );
      socket.off(
        SOCKET_EVENTS.USER_STOP_TYPING,
        handleUserStopTyping
      );
      socket.off(
        SOCKET_EVENTS.MESSAGES_READ,
        handleMessagesRead
      );
      socket.off(
        SOCKET_EVENTS.USER_ONLINE,
        handleUserOnline
      );
      socket.off(
        SOCKET_EVENTS.USER_OFFLINE,
        handleUserOffline
      );
      socket.off(
        SOCKET_EVENTS.JOINED_CONVERSATION,
        handleJoined
      );

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, isAuthenticated, user?.id]);

  const sendMessage = useCallback(
    (content, tempId) => {
      const socket = getSocket();
      if (!socket?.connected) return false;

      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationId,
        content,
        tempId,
      });

      return true;
    },
    [conversationId]
  );

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit(SOCKET_EVENTS.TYPING_START, {
      conversationId,
    });

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, {
        conversationId,
      });
    }, 2000);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId]);

  const markRead = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit(SOCKET_EVENTS.MARK_READ, {
      conversationId,
    });
    markConversationRead(conversationId, user?.id);
  }, [conversationId, user?.id, markConversationRead]);

  const typingUserIds = getTypingUsers(
    conversationId,
    user?.id
  );

  return {
    isConnected,
    isJoined,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    typingUserIds,
  };
}