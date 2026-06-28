/**
 * TESTES UNITÁRIOS — Strategy Pattern
 * Testa cada estratégia de processamento de status com mocks
 */

const { StatusStrategyFactory, ProcessandoStrategy, EnviadoStrategy, EntregueStrategy } = require('../src/application/StatusStrategy');
const { STATUS } = require('../src/domain/Pedido');

// Mock do repositório (sem banco de dados real)
const mockRepository = {
  atualizarStatus: jest.fn().mockResolvedValue({ id: 1, status: 'PROCESSANDO' }),
};

const mockPedido = { id: 1, status: STATUS.PENDENTE };

// Desliga os timeouts para os testes rodarem rápido
jest.useFakeTimers();

describe('StatusStrategyFactory', () => {
  it('deve retornar ProcessandoStrategy para status PENDENTE', () => {
    const strategy = StatusStrategyFactory.criar(STATUS.PENDENTE);
    expect(strategy).toBeInstanceOf(ProcessandoStrategy);
  });

  it('deve retornar EnviadoStrategy para status PROCESSANDO', () => {
    const strategy = StatusStrategyFactory.criar(STATUS.PROCESSANDO);
    expect(strategy).toBeInstanceOf(EnviadoStrategy);
  });

  it('deve retornar EntregueStrategy para status ENVIADO', () => {
    const strategy = StatusStrategyFactory.criar(STATUS.ENVIADO);
    expect(strategy).toBeInstanceOf(EntregueStrategy);
  });

  it('deve lançar erro para status sem estratégia', () => {
    expect(() => StatusStrategyFactory.criar(STATUS.ENTREGUE)).toThrow(
      'Nenhuma estratégia para o status: ENTREGUE'
    );
  });

  it('deve lançar erro para status FALHOU', () => {
    expect(() => StatusStrategyFactory.criar(STATUS.FALHOU)).toThrow(
      'Nenhuma estratégia para o status: FALHOU'
    );
  });
});

describe('ProcessandoStrategy', () => {
  it('deve atualizar status para PROCESSANDO e retornar resultado correto', async () => {
    const strategy = new ProcessandoStrategy();
    mockRepository.atualizarStatus.mockResolvedValueOnce({ id: 1, status: STATUS.PROCESSANDO });

    const promise = strategy.executar(mockPedido, mockRepository);
    jest.runAllTimers(); // Avança timers fake
    const resultado = await promise;

    expect(mockRepository.atualizarStatus).toHaveBeenCalledWith(1, STATUS.PROCESSANDO);
    expect(resultado.novoStatus).toBe(STATUS.PROCESSANDO);
    expect(resultado.mensagem).toBe('Pedido em processamento');
  });
});

describe('EnviadoStrategy', () => {
  it('deve atualizar status para ENVIADO', async () => {
    const strategy = new EnviadoStrategy();
    mockRepository.atualizarStatus.mockResolvedValueOnce({ id: 1, status: STATUS.ENVIADO });

    const promise = strategy.executar(mockPedido, mockRepository);
    jest.runAllTimers();
    const resultado = await promise;

    expect(mockRepository.atualizarStatus).toHaveBeenCalledWith(1, STATUS.ENVIADO);
    expect(resultado.novoStatus).toBe(STATUS.ENVIADO);
  });
});

describe('EntregueStrategy', () => {
  it('deve atualizar status para ENTREGUE', async () => {
    const strategy = new EntregueStrategy();
    mockRepository.atualizarStatus.mockResolvedValueOnce({ id: 1, status: STATUS.ENTREGUE });

    const promise = strategy.executar(mockPedido, mockRepository);
    jest.runAllTimers();
    const resultado = await promise;

    expect(mockRepository.atualizarStatus).toHaveBeenCalledWith(1, STATUS.ENTREGUE);
    expect(resultado.novoStatus).toBe(STATUS.ENTREGUE);
    expect(resultado.mensagem).toBe('Pedido entregue com sucesso!');
  });
});
