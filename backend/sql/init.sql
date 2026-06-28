-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  descricao TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  -- PENDENTE | PROCESSANDO | ENVIADO | ENTREGUE | FALHOU
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de status
CREATE TABLE IF NOT EXISTS historico_status (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id),
  status_anterior VARCHAR(20),
  status_novo VARCHAR(20) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

<<<<<<< HEAD
-- Dados de seed como exemplo
=======
-- Dados de seed pra demostrar
>>>>>>> e87be4665c85567272892e7600e859706560ee03
INSERT INTO usuarios (nome, email) VALUES
  ('João Silva', 'joao@email.com'),
  ('Maria Santos', 'maria@email.com')
ON CONFLICT (email) DO NOTHING;
