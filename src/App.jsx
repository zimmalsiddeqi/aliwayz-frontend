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

function SocketManager() {
  const { isAuthenticated, user } = useAuthStore();
  const { addMessage, setUserOnline, setUserOffline, setTyping } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const token = getAccessToken();
    const socket = getSocket(token);
    if (!socket) return;

    const handleMsg = ({ message, conversationId }) => {
      if (message && conversationId) addMessage(conversationId, message);
    };
    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId && userId && userId !== user?.id) {
        setTyping(conversationId, userId, true);
        setTimeout(() => setTyping(conversationId, userId, false), 3000);
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
    socket.on(SOCKET_EVENTS.USER_TYPING, handleTyping);
    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, handleStop);
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleOffline);
    socket.on(SOCKET_EVENTS.QR_SCANNED, handleQR);

    const ping = setInterval(() => {
      if (socket.connected) socket.emit(SOCKET_EVENTS.PING_PRESENCE);
    }, 20000);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMsg);
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
