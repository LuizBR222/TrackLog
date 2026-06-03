import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
});

export const pedidosService = {
  listar: (usuarioId = null) => {
    const params = usuarioId ? { usuarioId } : {};
    return api.get('/pedidos', { params }).then(r => r.data.dados);
  },
  buscarPorId: (id) => api.get(`/pedidos/${id}`).then(r => r.data.dados),
  criar: (dados) => api.post('/pedidos', dados).then(r => r.data.dados),
};

export const usuariosService = {
  listar: () => api.get('/usuarios').then(r => r.data.dados),
};
