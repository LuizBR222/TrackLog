/**
 * INTERFACES — Controllers REST
 * Recebe requisições HTTP e delega para os Casos de Uso
 */

const { Router } = require('express');

function criarPedidoRoutes(criarPedidoUseCase, listarPedidosUseCase, pedidoRepository) {
  const router = Router();

  // POST /pedidos — Cria um novo pedido
  router.post('/', async (req, res) => {
    try {
      const { usuarioId, descricao, enderecoEntrega } = req.body;
      const pedido = await criarPedidoUseCase.executar({ usuarioId, descricao, enderecoEntrega });
      return res.status(201).json({ sucesso: true, dados: pedido });
    } catch (err) {
      console.error('[Controller] Erro ao criar pedido:', err.message);
      return res.status(400).json({ sucesso: false, erro: err.message });
    }
  });

  // GET /pedidos — Lista todos os pedidos (admin)
  router.get('/', async (req, res) => {
    try {
      const { usuarioId } = req.query;
      const pedidos = await listarPedidosUseCase.executar(usuarioId ? Number(usuarioId) : null);
      return res.json({ sucesso: true, dados: pedidos });
    } catch (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
  });

  // GET /pedidos/:id — Busca pedido por ID
  router.get('/:id', async (req, res) => {
    try {
      const pedido = await pedidoRepository.buscarPorId(Number(req.params.id));
      if (!pedido) return res.status(404).json({ sucesso: false, erro: 'Pedido não encontrado' });
      return res.json({ sucesso: true, dados: pedido });
    } catch (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
  });

  return router;
}

function criarUsuarioRoutes(pedidoRepository) {
  const router = Router();

  // GET /usuarios — Lista todos os usuários
  router.get('/', async (req, res) => {
    try {
      const usuarios = await pedidoRepository.listarUsuarios();
      return res.json({ sucesso: true, dados: usuarios });
    } catch (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
  });

  return router;
}

module.exports = { criarPedidoRoutes, criarUsuarioRoutes };
