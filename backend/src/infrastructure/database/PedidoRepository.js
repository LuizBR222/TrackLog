/**
 * INFRASTRUCTURE — Repository Pattern
 * Isola o acesso ao banco de dados do restante da aplicação
 */

const { Pool } = require('pg');

class PedidoRepository {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
    });
  }

  async salvar({ usuarioId, descricao, enderecoEntrega }) {
    const query = `
      INSERT INTO pedidos (usuario_id, descricao, endereco_entrega, status)
      VALUES ($1, $2, $3, 'PENDENTE')
      RETURNING id, usuario_id AS "usuarioId", descricao, 
                endereco_entrega AS "enderecoEntrega", status, criado_em AS "criadoEm"
    `;
    const { rows } = await this.pool.query(query, [usuarioId, descricao, enderecoEntrega]);
    return rows[0];
  }

  async buscarPorId(id) {
    const query = `
      SELECT id, usuario_id AS "usuarioId", descricao,
             endereco_entrega AS "enderecoEntrega", status, 
             criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"
      FROM pedidos WHERE id = $1
    `;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async listarTodos() {
    const query = `
      SELECT p.id, p.usuario_id AS "usuarioId", u.nome AS "nomeUsuario",
             p.descricao, p.endereco_entrega AS "enderecoEntrega",
             p.status, p.criado_em AS "criadoEm", p.atualizado_em AS "atualizadoEm"
      FROM pedidos p
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.criado_em DESC
    `;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async listarPorUsuario(usuarioId) {
    const query = `
      SELECT id, usuario_id AS "usuarioId", descricao,
             endereco_entrega AS "enderecoEntrega", status, 
             criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"
      FROM pedidos WHERE usuario_id = $1
      ORDER BY criado_em DESC
    `;
    const { rows } = await this.pool.query(query, [usuarioId]);
    return rows;
  }

  async atualizarStatus(id, novoStatus) {
    // Salva histórico e atualiza status
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Busca status atual para o histórico
      const { rows: atual } = await client.query(
        'SELECT status FROM pedidos WHERE id = $1', [id]
      );

      if (!atual[0]) throw new Error(`Pedido ${id} não encontrado`);

      // Registra no histórico
      await client.query(
        `INSERT INTO historico_status (pedido_id, status_anterior, status_novo)
         VALUES ($1, $2, $3)`,
        [id, atual[0].status, novoStatus]
      );

      // Atualiza o pedido
      const { rows } = await client.query(
        `UPDATE pedidos SET status = $1, atualizado_em = NOW()
         WHERE id = $2
         RETURNING id, usuario_id AS "usuarioId", descricao,
                   endereco_entrega AS "enderecoEntrega", status,
                   criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"`,
        [novoStatus, id]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listarUsuarios() {
    const { rows } = await this.pool.query(
      'SELECT id, nome, email FROM usuarios ORDER BY nome'
    );
    return rows;
  }

  async fechar() {
    await this.pool.end();
  }
}

module.exports = { PedidoRepository };
