<<<<<<< HEAD
> 🇧🇷 [Versão em Português](README.pt-br.md)

# TrackLog — Delivery Tracking System

**Integrative Project — Information Systems 5th Semester | N2**

A distributed logistics system with asynchronous processing via Apache Kafka, hexagonal architecture, design patterns, and real-time updates via WebSocket.

---

## Screenshots

> <p align="center">
  <img src="screenshots/1.png" width="50%" alt="Tela Principal" />
  <img src="screenshots/2.png" width="50%" alt="Segunda Tela" />
  <img src="screenshots/3.png" width="50%" alt="Terceira Tela" />
<img src="screenshots/4.png" width="50%" alt="Quarta Tela" />
</p>


---

## Architecture

```
┌─────────────────┐     POST /orders       ┌──────────────────┐
│                 │ ──────────────────────> │                  │
│  React Frontend │                        │  REST API (3001) │
│  Socket.io      │ <── WebSocket (3002) ── │  + Kafka Producer│
│                 │    status_updated       │                  │
└─────────────────┘                        └────────┬─────────┘
                                                    │
                                           Publishes to topic
                                           "orders" on Kafka
=======
# TrackLog — Sistema de Rastreamento de Entregas

**Projeto Integrador — ADS 5º Período | N2**

Sistema distribuído de logística com processamento assíncrono via Apache Kafka, arquitetura hexagonal, design patterns e atualização em tempo real via WebSocket.

---

## Arquitetura

```
┌─────────────────┐     POST /pedidos      ┌──────────────────┐
│                 │ ──────────────────────> │                  │
│  Frontend React │                        │  API REST (3001) │
│  Socket.io      │ <── WebSocket (3002) ── │  + Kafka Producer│
│                 │    status_atualizado    │                  │
└─────────────────┘                        └────────┬─────────┘
                                                    │
                                           Publica em tópico
                                           "pedidos" no Kafka
>>>>>>> e87be4665c85567272892e7600e859706560ee03
                                                    │
                                           ┌────────▼─────────┐
                                           │                  │
                                           │  Worker (3002)   │
                                           │  Kafka Consumer  │
                                           │  + WebSocket     │
                                           │  Gateway         │
                                           └────────┬─────────┘
                                                    │
<<<<<<< HEAD
                                          Runs Strategy Pattern:
                                          PENDING → PROCESSING
                                          PROCESSING → SHIPPED
                                          SHIPPED → DELIVERED
                                                    │
                                           ┌────────▼─────────┐
                                           │   PostgreSQL     │
                                           │   (port 5432)    │
=======
                                          Executa Strategy Pattern:
                                          PENDENTE → PROCESSANDO
                                          PROCESSANDO → ENVIADO
                                          ENVIADO → ENTREGUE
                                                    │
                                           ┌────────▼─────────┐
                                           │   PostgreSQL     │
                                           │   (porta 5432)   │
>>>>>>> e87be4665c85567272892e7600e859706560ee03
                                           └──────────────────┘
```

---

<<<<<<< HEAD
## Design Patterns Applied

| Pattern | Where | Why |
|---------|-------|-----|
| **Strategy** | `StatusStrategy.js` | Each status has its own processing algorithm; easy to extend |
| **Factory** | `StatusStrategyFactory`, `KafkaProducerFactory` | Centralizes creation of complex objects |
| **Repository** | `PedidoRepository` | Decouples database access from business logic |
| **Dependency Injection** | `server.js`, `worker.js` | Allows swapping implementations without changing use cases |

---

## Project Structure

```
projeto-logistica/
├── docker-compose.yml          # Full orchestration
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   └── Pedido.js       # Pure domain entity
=======
## Design Patterns Aplicados

| Pattern | Onde | Por quê |
|---------|------|---------|
| **Strategy** | `StatusStrategy.js` | Cada status tem seu algoritmo de processamento; fácil de estender |
| **Factory** | `StatusStrategyFactory`, `KafkaProducerFactory` | Centraliza criação de objetos complexos |
| **Repository** | `PedidoRepository` | Desacopla acesso ao banco da lógica de negócio |
| **Dependency Injection** | `server.js`, `worker.js` | Permite trocar implementações sem alterar casos de uso |

---

## Estrutura do Projeto

```
projeto-logistica/
├── docker-compose.yml          # Orquestração completa
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   └── Pedido.js       # Entidade pura de domínio
>>>>>>> e87be4665c85567272892e7600e859706560ee03
│   │   ├── application/
│   │   │   ├── StatusStrategy.js        # Strategy + Factory Pattern
│   │   │   └── usecases/
│   │   │       ├── CriarPedidoUseCase.js
│   │   │       └── ListarPedidosUseCase.js
│   │   ├── infrastructure/
│   │   │   ├── kafka/
<<<<<<< HEAD
│   │   │   │   ├── KafkaProducer.js     # Publishes messages
│   │   │   │   └── KafkaConsumer.js     # Consumes and processes
│   │   │   ├── websocket/
│   │   │   │   └── WebSocketGateway.js  # Notifies frontend
=======
│   │   │   │   ├── KafkaProducer.js     # Publica mensagens
│   │   │   │   └── KafkaConsumer.js     # Consome e processa
│   │   │   ├── websocket/
│   │   │   │   └── WebSocketGateway.js  # Notifica frontend
>>>>>>> e87be4665c85567272892e7600e859706560ee03
│   │   │   └── database/
│   │   │       └── PedidoRepository.js  # Repository Pattern
│   │   ├── interfaces/
│   │   │   └── controllers/
<<<<<<< HEAD
│   │   │       └── PedidoController.js  # REST Controllers
│   │   ├── server.js           # API entry point
│   │   └── worker.js           # Consumer entry point
=======
│   │   │       └── PedidoController.js  # Controllers REST
│   │   ├── server.js           # Entry point da API
│   │   └── worker.js           # Entry point do Consumer
>>>>>>> e87be4665c85567272892e7600e859706560ee03
│   └── tests/
│       ├── Pedido.test.js
│       ├── StatusStrategy.test.js
│       └── CriarPedidoUseCase.test.js
└── frontend/
    └── src/
        ├── pages/
<<<<<<< HEAD
        │   ├── NovoPedido.js   # Order creation form
        │   └── Dashboard.js    # Admin panel
        ├── components/
        │   └── StatusBadge.js  # Badge + animated timeline
        ├── hooks/
        │   └── useWebSocket.js # WebSocket connection hook
        └── services/
            └── api.js          # HTTP communication layer
=======
        │   ├── NovoPedido.js   # Formulário de criação
        │   └── Dashboard.js    # Painel admin
        ├── components/
        │   └── StatusBadge.js  # Badge + Timeline animada
        ├── hooks/
        │   └── useWebSocket.js # Hook de conexão WebSocket
        └── services/
            └── api.js          # Camada de comunicação HTTP
>>>>>>> e87be4665c85567272892e7600e859706560ee03
```

---

<<<<<<< HEAD
## How to Run

### Prerequisites
- Docker and Docker Compose installed

### Start everything with a single command
=======
## Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Subir tudo com um comando
>>>>>>> e87be4665c85567272892e7600e859706560ee03

```bash
docker compose up --build
```

<<<<<<< HEAD
Wait ~30 seconds for Kafka to initialize. Then access:
=======
Aguarde ~30 segundos para o Kafka inicializar. Acesse:
>>>>>>> e87be4665c85567272892e7600e859706560ee03

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **WebSocket:** http://localhost:3002
- **Health check:** http://localhost:3001/health

<<<<<<< HEAD
### Run tests
=======
### Rodar testes
>>>>>>> e87be4665c85567272892e7600e859706560ee03

```bash
cd backend
npm install
npm test
<<<<<<< HEAD
# or with coverage:
=======
# ou com cobertura:
>>>>>>> e87be4665c85567272892e7600e859706560ee03
npm test -- --coverage
```

---

<<<<<<< HEAD
## Full Flow

1. Open http://localhost:3000
2. Select a customer and fill in the order
3. Click **Create Order**
4. Watch the animated timeline update automatically:
   - `PENDING` → `PROCESSING` (1s)
   - `PROCESSING` → `SHIPPED` (3s)
   - `SHIPPED` → `DELIVERED` (5s)
5. **Updates happen without page refresh** — via Kafka + WebSocket
6. Open http://localhost:3000/dashboard to see all orders

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| Apache Kafka 7.5 | Message broker (topic `orders`) |
| Node.js + Express | REST API and Worker |
| Socket.io | WebSocket for real-time updates |
| PostgreSQL 16 | Persistence with status history |
| React 18 | User interface |
| Docker Compose | All-services orchestration |
| Jest + Supertest | Unit and integration tests |
=======
## Fluxo Completo (para a banca)

1. Acesse http://localhost:3000
2. Selecione um cliente e preencha o pedido
3. Clique em **Criar Pedido**
4. Observe a timeline animada atualizando automaticamente:
   - `PENDENTE` → `PROCESSANDO` (1s)
   - `PROCESSANDO` → `ENVIADO` (3s)
   - `ENVIADO` → `ENTREGUE` (5s)
5. **A atualização acontece sem refresh** — via Kafka + WebSocket
6. Abra http://localhost:3000/dashboard para ver todos os pedidos

---

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| Apache Kafka 7.5 | Broker de mensagens (tópico `pedidos`) |
| Node.js + Express | API REST e Worker |
| Socket.io | WebSocket para atualização em tempo real |
| PostgreSQL 16 | Persistência com histórico de status |
| React 18 | Interface do usuário |
| Docker Compose | Orquestração de todos os serviços |
| Jest + Supertest | Testes unitários e de integração |

>>>>>>> e87be4665c85567272892e7600e859706560ee03
