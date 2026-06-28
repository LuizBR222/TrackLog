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
                                                    │
                                           ┌────────▼─────────┐
                                           │                  │
                                           │  Worker (3002)   │
                                           │  Kafka Consumer  │
                                           │  + WebSocket     │
                                           │  Gateway         │
                                           └────────┬─────────┘
                                                    │
                                          Runs Strategy Pattern:
                                          PENDING → PROCESSING
                                          PROCESSING → SHIPPED
                                          SHIPPED → DELIVERED
                                                    │
                                           ┌────────▼─────────┐
                                           │   PostgreSQL     │
                                           │   (port 5432)    │
                                           └──────────────────┘
```

---

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
│   │   ├── application/
│   │   │   ├── StatusStrategy.js        # Strategy + Factory Pattern
│   │   │   └── usecases/
│   │   │       ├── CriarPedidoUseCase.js
│   │   │       └── ListarPedidosUseCase.js
│   │   ├── infrastructure/
│   │   │   ├── kafka/
│   │   │   │   ├── KafkaProducer.js     # Publishes messages
│   │   │   │   └── KafkaConsumer.js     # Consumes and processes
│   │   │   ├── websocket/
│   │   │   │   └── WebSocketGateway.js  # Notifies frontend
│   │   │   └── database/
│   │   │       └── PedidoRepository.js  # Repository Pattern
│   │   ├── interfaces/
│   │   │   └── controllers/
│   │   │       └── PedidoController.js  # REST Controllers
│   │   ├── server.js           # API entry point
│   │   └── worker.js           # Consumer entry point
│   └── tests/
│       ├── Pedido.test.js
│       ├── StatusStrategy.test.js
│       └── CriarPedidoUseCase.test.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── NovoPedido.js   # Order creation form
        │   └── Dashboard.js    # Admin panel
        ├── components/
        │   └── StatusBadge.js  # Badge + animated timeline
        ├── hooks/
        │   └── useWebSocket.js # WebSocket connection hook
        └── services/
            └── api.js          # HTTP communication layer
```

---

## How to Run

### Prerequisites
- Docker and Docker Compose installed

### Start everything with a single command

```bash
docker compose up --build
```

Wait ~30 seconds for Kafka to initialize. Then access:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **WebSocket:** http://localhost:3002
- **Health check:** http://localhost:3001/health

### Run tests

```bash
cd backend
npm install
npm test
# or with coverage:
npm test -- --coverage
```

---

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