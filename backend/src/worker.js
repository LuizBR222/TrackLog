/**
 * ENTRY POINT — Worker (Consumidor Kafka)
 * Processo separado da API. Consome mensagens e notifica via WebSocket
 * DESACOPLAMENTO TOTAL
 */

require('dotenv').config();

const { PedidoRepository } = require('./infrastructure/database/PedidoRepository');
const { KafkaConsumer } = require('./infrastructure/kafka/KafkaConsumer');
const { WebSocketGateway } = require('./infrastructure/websocket/WebSocketGateway');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://logistica:logistica123@localhost:5432/logistica_db';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3002;

async function iniciarWorker() {
  // Composição das dependências
  const pedidoRepository = new PedidoRepository(DATABASE_URL);

  // WebSocket Gateway inicia primeiro
  const websocketGateway = new WebSocketGateway(Number(WEBSOCKET_PORT));
  websocketGateway.iniciar();

  // Consumer Kafka com injeção de dependências
  const kafkaConsumer = new KafkaConsumer(KAFKA_BROKER, pedidoRepository, websocketGateway);

  // Aguarda Kafka estar disponível
  let tentativas = 0;
  while (tentativas < 10) {
    try {
      await kafkaConsumer.iniciar();
      console.log('[Worker] Iniciado com sucesso!');
      break;
    } catch (err) {
      tentativas++;
      console.log(`[Worker] Kafka indisponível, tentativa ${tentativas}/10. Aguardando 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  process.on('SIGTERM', async () => {
    await kafkaConsumer.parar();
    await pedidoRepository.fechar();
    process.exit(0);
  });
}

iniciarWorker().catch((err) => {
  console.error('[Worker] Erro fatal:', err);
  process.exit(1);
});
