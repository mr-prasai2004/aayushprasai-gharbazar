import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  senderId: string;
  content: string;
  receiverId?: string;
  timestamp: string;
}

interface UseWebSocketProps {
  onMessageReceived?: (message: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useWebSocket = (props?: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Use refs for callbacks to avoid re-connecting on every render
  const callbacksRef = useRef(props);

  useEffect(() => {
    callbacksRef.current = props;
  });

  const getWebSocketUrl = useCallback(() => {
    const defaultApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://aayushprasai-gharbazar-production.up.railway.app/api';
    // Convert http/https to ws/wss and append /api/ws
    let wsUrl = defaultApiUrl.replace(/^http/, 'ws');
    if (wsUrl.endsWith('/api')) {
       wsUrl += '/ws';
    } else {
       wsUrl += '/api/ws';
    }
    return wsUrl;
  }, []);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token available, cannot connect to WebSocket');
        setError('No authentication token');
        return;
      }

      const wsUrl = getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      // Set up all handlers BEFORE the connection opens
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Message received:', message);
          callbacksRef.current?.onMessageReceived?.(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
        callbacksRef.current?.onDisconnected?.();

        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log('Attempting to reconnect...');
            connect();
          }
        }, 3000);
      };

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);

        try {
          // Send auth token with senderId
          const currentUser = localStorage.getItem('currentUser');
          const senderId = currentUser ? JSON.parse(currentUser).userId : 'anonymous';
          const authMessage = {
            type: 'authenticate',
            token,
            senderId,
          };
          console.log('📤 Sending authenticate message:', authMessage);

          ws.send(JSON.stringify(authMessage));
          console.log('✅ Authenticate message sent');
        } catch (err) {
          console.error('❌ Error sending authenticate message:', err);
          ws.close();
          return;
        }


        callbacksRef.current?.onConnected?.();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(String(err));
    }
  }, [getWebSocketUrl, getAuthToken]);

  // Send message
  const sendMessage = useCallback(
    (receiverId: string, content: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        setError('WebSocket is not connected');
        return false;
      }

      try {
        const currentUser = localStorage.getItem('currentUser');
        const senderId = currentUser ? JSON.parse(currentUser).userId : 'anonymous';

        wsRef.current.send(
          JSON.stringify({
            type: 'message',
            senderId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
          })
        );
        console.log('📤 Message sent:', { senderId, receiverId, content });
        return true;
      } catch (err) {
        console.error('Error sending message:', err);
        setError(String(err));
        return false;
      }
    },
    []
  );

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
