/**
 * DOMÍNIO — Entidade Pedido
 */

const STATUS = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  ENVIADO: 'ENVIADO',
  ENTREGUE: 'ENTREGUE',
  FALHOU: 'FALHOU',
};

const TRANSICOES_VALIDAS = {
  [STATUS.PENDENTE]: [STATUS.PROCESSANDO],
  [STATUS.PROCESSANDO]: [STATUS.ENVIADO, STATUS.FALHOU],
  [STATUS.ENVIADO]: [STATUS.ENTREGUE, STATUS.FALHOU],
  [STATUS.ENTREGUE]: [],
  [STATUS.FALHOU]: [],
};

class Pedido {
  constructor({ id, usuarioId, descricao, enderecoEntrega, status = STATUS.PENDENTE, criadoEm }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.descricao = descricao;
    this.enderecoEntrega = enderecoEntrega;
    this.status = status;
    this.criadoEm = criadoEm || new Date();
  }

  podeMudarPara(novoStatus) {
    const transicoesPermitidas = TRANSICOES_VALIDAS[this.status] || [];
    return transicoesPermitidas.includes(novoStatus);
  }

  atualizarStatus(novoStatus) {
    if (!this.podeMudarPara(novoStatus)) {
      throw new Error(
        `Transição inválida: ${this.status} → ${novoStatus}`
      );
    }
    const statusAnterior = this.status;
    this.status = novoStatus;
    return statusAnterior;
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      descricao: this.descricao,
      enderecoEntrega: this.enderecoEntrega,
      status: this.status,
      criadoEm: this.criadoEm,
    };
  }
}

module.exports = { Pedido, STATUS, TRANSICOES_VALIDAS };
