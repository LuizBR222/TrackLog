/**
 * TESTES UNITÁRIOS — CriarPedidoUseCase
 * Testa o caso de uso com mocks de repositório e Kafka
 */

const { CriarPedidoUseCase } = require('../src/application/usecases/CriarPedidoUseCase');

// Mocks com jest.fn()
const mockPedidoRepository = {
  salvar: jest.fn(),
};

const mockKafkaProducer = {
  publicar: jest.fn().mockResolvedValue(undefined),
};

describe('CriarPedidoUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CriarPedidoUseCase(mockPedidoRepository, mockKafkaProducer);
  });

  it('deve criar pedido e publicar no Kafka', async () => {
    const dadosPedido = {
      usuarioId: 1,
      descricao: 'Mouse Logitech',
      enderecoEntrega: 'Av. Brasil, 500',
    };

    mockPedidoRepository.salvar.mockResolvedValueOnce({
      id: 42,
      usuarioId: 1,
      descricao: 'Mouse Logitech',
      enderecoEntrega: 'Av. Brasil, 500',
      status: 'PENDENTE',
      criadoEm: new Date(),
    });

    const resultado = await useCase.executar(dadosPedido);

    // Repositório foi chamado com os dados corretos
    expect(mockPedidoRepository.salvar).toHaveBeenCalledWith(dadosPedido);

    // Kafka foi chamado com o tópico correto
    expect(mockKafkaProducer.publicar).toHaveBeenCalledWith(
      'pedidos',
      expect.objectContaining({
        pedidoId: 42,
        usuarioId: 1,
        status: 'PENDENTE',
      })
    );

    // Retorna o pedido criado
    expect(resultado.id).toBe(42);
    expect(resultado.status).toBe('PENDENTE');
  });

  it('deve lançar erro se usuarioId não for fornecido', async () => {
    await expect(
      useCase.executar({ descricao: 'Produto', enderecoEntrega: 'Rua X' })
    ).rejects.toThrow('usuarioId, descricao e enderecoEntrega são obrigatórios');

    // Kafka NÃO deve ser chamado em caso de erro
    expect(mockKafkaProducer.publicar).not.toHaveBeenCalled();
  });

  it('deve lançar erro se descricao não for fornecida', async () => {
    await expect(
      useCase.executar({ usuarioId: 1, enderecoEntrega: 'Rua X' })
    ).rejects.toThrow();
  });

  it('não deve chamar Kafka se o repositório falhar', async () => {
    mockPedidoRepository.salvar.mockRejectedValueOnce(new Error('Erro no banco'));

    await expect(
      useCase.executar({ usuarioId: 1, descricao: 'Produto', enderecoEntrega: 'Rua X' })
    ).rejects.toThrow('Erro no banco');

    expect(mockKafkaProducer.publicar).not.toHaveBeenCalled();
  });
});
