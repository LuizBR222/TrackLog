/**
 * ENTRY POINT — API Server
 * Compõe todas as dependências (Composition Root) e inicia o servidor HTTP
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { PedidoRepository } = require('./infrastructure/database/PedidoRepository');
const { KafkaProducerFactory } = require('./infrastructure/kafka/KafkaProducer');
const { CriarPedidoUseCase } = require('./application/usecases/CriarPedidoUseCase');
const { ListarPedidosUseCase } = require('./application/usecases/ListarPedidosUseCase');
const { criarPedidoRoutes, criarUsuarioRoutes } = require('./interfaces/controllers/PedidoController');

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://logistica:logistica123@localhost:5432/logistica_db';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

async function iniciar() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Composição das dependências (Dependency Injection manual)
  const pedidoRepository = new PedidoRepository(DATABASE_URL);
  const kafkaProducer = KafkaProducerFactory.criar(KAFKA_BROKER);

  await kafkaProducer.conectar();

  const criarPedidoUseCase = new CriarPedidoUseCase(pedidoRepository, kafkaProducer);
  const listarPedidosUseCase = new ListarPedidosUseCase(pedidoRepository);

  // Rotas
  app.use('/api/pedidos', criarPedidoRoutes(criarPedidoUseCase, listarPedidosUseCase, pedidoRepository));
  app.use('/api/usuarios', criarUsuarioRoutes(pedidoRepository));

  // Health check
  app.get('/health', (req, res) => res.json({ status: 'ok', servico: 'logistica-api' }));

  app.listen(PORT, () => {
    console.log(`[API] Servidor rodando na porta ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await kafkaProducer.desconectar();
    await pedidoRepository.fechar();
    process.exit(0);
  });
}

iniciar().catch((err) => {
  console.error('[API] Erro fatal ao iniciar:', err);
  process.exit(1);
});
