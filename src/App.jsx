import { useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '@lib/queryClient';
import AppRouter from '@router/index';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { ToastContainer } from '@components/ui/Toast';
import useUIStore from '@store/ui.store';
import useAuthStore from '@store/auth.store';
import { getSocket, disconnectSocket, SOCKET_EVENTS } from '@lib/socket';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@api/axios.instance';
import axiosInstance from '@api/axios.instance';
import { API } from '@api/api.endpoints';
import useChatStore from '@store/chat.store';
import useNotificationStore from '@store/notification.store';
import NotificationService from '@api/services/notification.service';
import ChatService from '@api/services/chat.service';
import { useFavoritesStore } from '@store/favorites.store';
import toast from '@lib/toast';

function AuthInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!token) {
        useAuthStore.getState().setInitialized();
        return;
      }

      try {
        const response = await axiosInstance.get(API.USERS.ME);
        const userData = response.data?.data;

        if (userData) {
          useAuthStore.setState({
            user: userData,
            accessToken: token,
            refreshToken,
            isAuthenticated: true,
            isInitialized: true,
          });
          getSocket(token);
          return;
        }
      } catch (error) {
        if (error?.response?.status === 401 && refreshToken) {
          try {
            const refreshRes = await axiosInstance.post(API.AUTH.REFRESH, {
              refresh_token: refreshToken,
            });
            const newData = refreshRes.data?.data;

            if (newData?.access_token) {
              setTokens(newData.access_token, newData.refresh_token);
              const userRes = await axiosInstance.get(API.USERS.ME);
              const userData = userRes.data?.data;

              if (userData) {
                useAuthStore.setState({
                  user: userData,
                  accessToken: newData.access_token,
                  refreshToken: newData.refresh_token || refreshToken,
                  isAuthenticated: true,
                  isInitialized: true,
                });
                getSocket(newData.access_token);
                return;
              }
            }
          } catch {
            clearTokens();
          }
        }
      }

      clearTokens();
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    };

    init();
  }, []);

  return null;
}

function playChatNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio autoplay restrictions before interaction
  }
}

function SocketManager() {
  const { isAuthenticated, user } = useAuthStore();
  const { addMessage, setUserOnline, setUserOffline, setTyping } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    // Fetch initial notification badge counts on authentication
    NotificationService.getAll({ page: 1, limit: 10 })
      .then((res) => {
        if (res?.data) {
          useNotificationStore.getState().setNotifications(res.data, res.unread_count);
        }
      })
      .catch(() => {});

    ChatService.getConversations({ page: 1, limit: 50 })
      .then((res) => {
        if (res?.data) {
          useChatStore.getState().setConversations(res.data);
        }
      })
      .catch(() => {});

    const token = getAccessToken();
    const socket = getSocket(token);
    if (!socket) return;

    const handleMsg = ({ message, conversationId }) => {
      if (message && conversationId) {
        addMessage(conversationId, message);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        // If message is from someone else
        if (message.sender_id !== user?.id) {
          // Increment notification bell active number
          useNotificationStore.getState().setUnreadCount(
            (useNotificationStore.getState().unreadCount || 0) + 1
          );

          // Direct visible popup notification alert wherever the user is on the site
          if (!window.location.pathname.includes(`/inbox/${conversationId}`)) {
            playChatNotificationSound();
            const senderName = message.sender?.username || 'User';
            toast.success(`💬 Message from ${senderName}: "${message.content?.substring(0, 45)}..."`, {
              duration: 7000,
              style: {
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-brand)',
                fontWeight: '600',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
              },
            });
          }
        }
      }
    };

    const handleNewNotification = () => {
      useNotificationStore.getState().setUnreadCount(
        (useNotificationStore.getState().unreadCount || 0) + 1
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId && userId && userId !== user?.id) {
        setTyping(conversationId, userId, true);
      }
    };
    const handleStop = ({ conversationId, userId }) => {
      if (conversationId && userId) setTyping(conversationId, userId, false);
    };
    const handleOnline = ({ userId }) => {
      if (userId) setUserOnline(userId);
    };
    const handleOffline = ({ userId }) => {
      if (userId) setUserOffline(userId);
    };
    const handleQR = (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data?.productId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMsg);
    socket.on('new_notification', handleNewNotification);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleTyping);
    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, handleStop);
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleOffline);
    socket.on(SOCKET_EVENTS.QR_SCANNED, handleQR);

    if (socket.connected) {
      socket.emit(SOCKET_EVENTS.PING_PRESENCE);
    }

    const ping = setInterval(() => {
      if (socket.connected) socket.emit(SOCKET_EVENTS.PING_PRESENCE);
    }, 15000);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMsg);
      socket.off('new_notification', handleNewNotification);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleTyping);
      socket.off(SOCKET_EVENTS.USER_STOP_TYPING, handleStop);
      socket.off(SOCKET_EVENTS.USER_ONLINE, handleOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, handleOffline);
      socket.off(SOCKET_EVENTS.QR_SCANNED, handleQR);
      clearInterval(ping);
    };
  }, [isAuthenticated, user?.id]);

  return null;
}

function FavoritesManager() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);
  const isFavoritesInitialized = useFavoritesStore((s) => s.isInitialized);

  useEffect(() => {
    if (isAuthenticated && !isFavoritesInitialized) {
      fetchFavorites();
    }
  }, [isAuthenticated, isFavoritesInitialized, fetchFavorites]);

  return null;
}

function ThemeInitializer() {
  const { theme } = useUIStore();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeInitializer />
          <AuthInitializer />
          <FavoritesManager />
          <SocketManager />
          <AppRouter />
          <ToastContainer />
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
