/**
 * CASO DE USO: Listar Pedidos
 */

class ListarPedidosUseCase {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async executar(usuarioId = null) {
    if (usuarioId) {
      return this.pedidoRepository.listarPorUsuario(usuarioId);
    }
    return this.pedidoRepository.listarTodos();
  }
}

module.exports = { ListarPedidosUseCase };
