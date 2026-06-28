import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3002';

export function useWebSocket(onStatusAtualizado) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Conectado:', socket.id);
      // Assina a sala admin para receber todos os eventos
      socket.emit('assinar_todos');
    });

    socket.on('status_atualizado', (dados) => {
      console.log('[WebSocket] Status atualizado:', dados);
      if (onStatusAtualizado) onStatusAtualizado(dados);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado');
    });

    return () => {
      socket.disconnect();
    };
  }, []); 

  const assinarPedido = useCallback((pedidoId) => {
    if (socketRef.current) {
      socketRef.current.emit('assinar_pedido', { pedidoId });
    }
  }, []);

  return { assinarPedido };
}
