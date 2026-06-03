/**
 * TESTES UNITÁRIOS — Entidade Pedido (Domínio)
 * Testa regras de negocio puras sem dependências externas
 */

const { Pedido, STATUS } = require('../src/domain/Pedido');

describe('Pedido — Entidade de Domínio', () => {
  let pedido;

  beforeEach(() => {
    pedido = new Pedido({
      id: 1,
      usuarioId: 10,
      descricao: 'Notebook Dell XPS',
      enderecoEntrega: 'Rua das Flores, 123',
      status: STATUS.PENDENTE,
    });
  });

  describe('Criação', () => {
    it('deve criar pedido com status PENDENTE por padrão', () => {
      const novoPedido = new Pedido({
        id: 2,
        usuarioId: 10,
        descricao: 'Teclado',
        enderecoEntrega: 'Rua A, 1',
      });
      expect(novoPedido.status).toBe(STATUS.PENDENTE);
    });

    it('deve preservar os dados fornecidos', () => {
      expect(pedido.id).toBe(1);
      expect(pedido.usuarioId).toBe(10);
      expect(pedido.descricao).toBe('Notebook Dell XPS');
      expect(pedido.enderecoEntrega).toBe('Rua das Flores, 123');
    });
  });

  describe('Transições de Status', () => {
    it('deve permitir PENDENTE → PROCESSANDO', () => {
      expect(pedido.podeMudarPara(STATUS.PROCESSANDO)).toBe(true);
    });

    it('deve impedir PENDENTE → ENTREGUE (pulo de status)', () => {
      expect(pedido.podeMudarPara(STATUS.ENTREGUE)).toBe(false);
    });

    it('deve impedir PENDENTE → ENVIADO', () => {
      expect(pedido.podeMudarPara(STATUS.ENVIADO)).toBe(false);
    });

    it('deve permitir PROCESSANDO → ENVIADO', () => {
      pedido.status = STATUS.PROCESSANDO;
      expect(pedido.podeMudarPara(STATUS.ENVIADO)).toBe(true);
    });

    it('deve permitir PROCESSANDO → FALHOU', () => {
      pedido.status = STATUS.PROCESSANDO;
      expect(pedido.podeMudarPara(STATUS.FALHOU)).toBe(true);
    });

    it('deve impedir qualquer transição a partir de ENTREGUE', () => {
      pedido.status = STATUS.ENTREGUE;
      expect(pedido.podeMudarPara(STATUS.PENDENTE)).toBe(false);
      expect(pedido.podeMudarPara(STATUS.PROCESSANDO)).toBe(false);
    });
  });

  describe('Atualização de Status', () => {
    it('deve atualizar o status e retornar o status anterior', () => {
      const statusAnterior = pedido.atualizarStatus(STATUS.PROCESSANDO);
      expect(statusAnterior).toBe(STATUS.PENDENTE);
      expect(pedido.status).toBe(STATUS.PROCESSANDO);
    });

    it('deve lançar erro em transição inválida', () => {
      expect(() => pedido.atualizarStatus(STATUS.ENTREGUE)).toThrow(
        'Transição inválida: PENDENTE → ENTREGUE'
      );
    });
  });

  describe('Serialização', () => {
    it('deve serializar para JSON corretamente', () => {
      const json = pedido.toJSON();
      expect(json).toEqual({
        id: 1,
        usuarioId: 10,
        descricao: 'Notebook Dell XPS',
        enderecoEntrega: 'Rua das Flores, 123',
        status: STATUS.PENDENTE,
        criadoEm: expect.any(Date),
      });
    });
  });
});
