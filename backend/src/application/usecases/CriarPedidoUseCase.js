/**
 * CASO DE USO: Criar Pedido
 * Orquestra a criação do pedido e publicação no Kafka
 * Usa Injeção de Dependência (DI) — não instancia dependências diretamente
 */

const { Pedido } = require('../../domain/Pedido');

class CriarPedidoUseCase {
  /**
   * @param {Object} pedidoRepository - Repositório de pedidos (Repository Pattern)
   * @param {Object} kafkaProducer - Producer Kafka (desacoplado via DI)
   */
  constructor(pedidoRepository, kafkaProducer) {
    this.pedidoRepository = pedidoRepository;
    this.kafkaProducer = kafkaProducer;
  }

  async executar({ usuarioId, descricao, enderecoEntrega }) {
    // Validação de domínio
    if (!usuarioId || !descricao || !enderecoEntrega) {
      throw new Error('usuarioId, descricao e enderecoEntrega são obrigatórios');
    }

    // Persiste o pedido no banco como PENDENTE
    const pedidoSalvo = await this.pedidoRepository.salvar({
      usuarioId,
      descricao,
      enderecoEntrega,
    });

    const pedido = new Pedido(pedidoSalvo);

    // Publica no Kafka — desacoplado, não processa aqui
    await this.kafkaProducer.publicar('pedidos', {
      pedidoId: pedido.id,
      usuarioId: pedido.usuarioId,
      status: pedido.status,
      timestamp: new Date().toISOString(),
    });

    return pedido.toJSON();
  }
}

module.exports = { CriarPedidoUseCase };
