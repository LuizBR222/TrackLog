/**
 * INFRASTRUCTURE — Kafka Producer
 * DESIGN PATTERN: Factory (KafkaProducerFactory)
 */

const { Kafka, Partitioners } = require('kafkajs');

class KafkaProducer {
  constructor(broker) {
    this.kafka = new Kafka({
      clientId: 'logistica-api',
      brokers: [broker],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.conectado = false;
  }

  async conectar() {
    if (!this.conectado) {
      await this.producer.connect();
      this.conectado = true;
      console.log('[Kafka Producer] Conectado ao broker');
    }
  }

  async publicar(topico, mensagem) {
    if (!this.conectado) await this.conectar();

    await this.producer.send({
      topic: topico,
      messages: [
        {
          key: String(mensagem.pedidoId),
          value: JSON.stringify(mensagem),
          timestamp: Date.now().toString(),
        },
      ],
    });

    console.log(`[Kafka Producer] Mensagem publicada no tópico "${topico}":`, mensagem);
  }

  async desconectar() {
    if (this.conectado) {
      await this.producer.disconnect();
      this.conectado = false;
    }
  }
}

/**
 * Factory — cria instância única (Singleton) do producer
 */
class KafkaProducerFactory {
  static instancia = null;

  static criar(broker) {
    if (!KafkaProducerFactory.instancia) {
      KafkaProducerFactory.instancia = new KafkaProducer(broker);
    }
    return KafkaProducerFactory.instancia;
  }
}

module.exports = { KafkaProducer, KafkaProducerFactory };
