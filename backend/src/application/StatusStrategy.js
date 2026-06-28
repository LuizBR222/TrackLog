/**
 * DESIGN PATTERN: Strategy
 * Cada status de processamento tem sua própria estratégia
 * Modificar o código existente fica mais facil (Open/Closed Principle)
 */

const { STATUS } = require('../domain/Pedido');

// Interface base (contrato da estratégia)
class StatusStrategy {
  async executar(pedido, pedidoRepository) {
    throw new Error('Método executar() deve ser implementado');
  }
}

// Estratégia: PENDENTE --> PROCESSANDO
class ProcessandoStrategy extends StatusStrategy {
  async executar(pedido, pedidoRepository) {
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simula processamento
    await pedidoRepository.atualizarStatus(pedido.id, STATUS.PROCESSANDO);
    return { novoStatus: STATUS.PROCESSANDO, mensagem: 'Pedido em processamento' };
  }
}

// Estratégia: PROCESSANDO --> ENVIADO
class EnviadoStrategy extends StatusStrategy {
  async executar(pedido, pedidoRepository) {
    await new Promise(resolve => setTimeout(resolve, 8000)); // Simula separação e envio
    await pedidoRepository.atualizarStatus(pedido.id, STATUS.ENVIADO);
    return { novoStatus: STATUS.ENVIADO, mensagem: 'Pedido enviado para entrega' };
  }
}

// Estratégia: ENVIADO --> ENTREGUE
class EntregueStrategy extends StatusStrategy {
  async executar(pedido, pedidoRepository) {
    await new Promise(resolve => setTimeout(resolve, 8000)); // Simula tempo de entrega
    await pedidoRepository.atualizarStatus(pedido.id, STATUS.ENTREGUE);
    return { novoStatus: STATUS.ENTREGUE, mensagem: 'Pedido entregue com sucesso!' };
  }
}

// Estratégia: Falha
class FalhouStrategy extends StatusStrategy {
  async executar(pedido, pedidoRepository) {
    await pedidoRepository.atualizarStatus(pedido.id, STATUS.FALHOU);
    return { novoStatus: STATUS.FALHOU, mensagem: 'Falha no processamento do pedido' };
  }
}

/**
 * DESIGN PATTERN: Factory
 * Cria a estratégia correta baseada no status atual do pedido.
 */
class StatusStrategyFactory {
  static criar(statusAtual) {
    const strategies = {
      [STATUS.PENDENTE]: new ProcessandoStrategy(),
      [STATUS.PROCESSANDO]: new EnviadoStrategy(),
      [STATUS.ENVIADO]: new EntregueStrategy(),
    };

    const strategy = strategies[statusAtual];
    if (!strategy) {
      throw new Error(`Nenhuma estratégia para o status: ${statusAtual}`);
    }
    return strategy;
  }
}

module.exports = {
  StatusStrategyFactory,
  ProcessandoStrategy,
  EnviadoStrategy,
  EntregueStrategy,
  FalhouStrategy,
};
