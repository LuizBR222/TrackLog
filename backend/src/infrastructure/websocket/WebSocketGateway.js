/**
 * INFRASTRUCTURE — WebSocket Gateway
 * Gerencia conexões Socket.io e emite eventos de status em tempo real
 */

const { Server } = require('socket.io');
const http = require('http');

class WebSocketGateway {
  constructor(port) {
    this.port = port;
    this.httpServer = http.createServer();
    this.io = new Server(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    this.clientes = new Map(); 
  }

  iniciar() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

      // Cliente se registra para receber atualizações de um pedido específico
      socket.on('assinar_pedido', ({ pedidoId }) => {
        socket.join(`pedido:${pedidoId}`);
        console.log(`[WebSocket] Socket ${socket.id} assinou pedido ${pedidoId}`);
      });

      // Cliente assina todos os pedidos (dashboard admin)
      socket.on('assinar_todos', () => {
        socket.join('admin');
        console.log(`[WebSocket] Socket ${socket.id} entrou na sala admin`);
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`[WebSocket] Servidor escutando na porta ${this.port}`);
    });
  }

  emitirAtualizacaoStatus(dados) {
    const { pedidoId } = dados;

    // Emite para quem está assistindo este pedido específico
    this.io.to(`pedido:${pedidoId}`).emit('status_atualizado', dados);

    // Emite também para o dashboard admin
    this.io.to('admin').emit('status_atualizado', dados);

    console.log(`[WebSocket] Evento emitido para pedido ${pedidoId}:`, dados.novoStatus);
  }

  getIO() {
    return this.io;
  }
}

module.exports = { WebSocketGateway };
