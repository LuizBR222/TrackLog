/**
 * INFRASTRUCTURE — Kafka Consumer
 * Consome mensagens do tópico "pedidos" e executa a estratégia de processamento
 * Emite eventos via WebSocket após cada mudança de status
 */

const { Kafka } = require('kafkajs');
const { StatusStrategyFactory } = require('../../application/StatusStrategy');
const { Pedido, STATUS } = require('../../domain/Pedido');

class KafkaConsumer {
  /**
   * @param {string} broker - Endereço do broker Kafka
   * @param {Object} pedidoRepository - Injetado via DI
   * @param {Object} websocketGateway - Injetado via DI para emitir eventos
   */
  constructor(broker, pedidoRepository, websocketGateway) {
    this.kafka = new Kafka({
      clientId: 'logistica-worker',
      brokers: [broker],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
    this.consumer = this.kafka.consumer({ groupId: 'logistica-group' });
    this.pedidoRepository = pedidoRepository;
    this.websocketGateway = websocketGateway;
  }

  async iniciar() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'pedidos', fromBeginning: false });

    console.log('[Kafka Consumer] Aguardando mensagens no tópico "pedidos"...');

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const dados = JSON.parse(message.value.toString());
          console.log('[Kafka Consumer] Mensagem recebida:', dados);

          await this.processarPedido(dados.pedidoId);
        } catch (err) {
          console.error('[Kafka Consumer] Erro ao processar mensagem:', err.message);
        }
      },
    });
  }

  async processarPedido(pedidoId) {
    // Busca o pedido atual no banco
    const dadosPedido = await this.pedidoRepository.buscarPorId(pedidoId);
    if (!dadosPedido) {
      console.error(`[Consumer] Pedido ${pedidoId} não encontrado`);
      return;
    }

    const pedido = new Pedido(dadosPedido);

    // Status que ainda precisam ser processados
    const statusParaProcessar = [STATUS.PENDENTE, STATUS.PROCESSANDO, STATUS.ENVIADO];

    if (!statusParaProcessar.includes(pedido.status)) {
      console.log(`[Consumer] Pedido ${pedidoId} já em status final: ${pedido.status}`);
      return;
    }

    // Usa o Strategy Pattern para processar
    const strategy = StatusStrategyFactory.criar(pedido.status);
    const resultado = await strategy.executar(pedido, this.pedidoRepository);

    console.log(`[Consumer] Pedido ${pedidoId}: ${pedido.status} → ${resultado.novoStatus}`);

    // Emite evento WebSocket para notificar o frontend
    this.websocketGateway.emitirAtualizacaoStatus({
      pedidoId,
      statusAnterior: pedido.status,
      novoStatus: resultado.novoStatus,
      mensagem: resultado.mensagem,
      timestamp: new Date().toISOString(),
    });

    // Continua processando até chegar no status final
    const statusFinais = [STATUS.ENTREGUE, STATUS.FALHOU];
    if (!statusFinais.includes(resultado.novoStatus)) {
      await this.processarPedido(pedidoId);
    }
  }

  async parar() {
    await this.consumer.disconnect();
  }
}

module.exports = { KafkaConsumer };
