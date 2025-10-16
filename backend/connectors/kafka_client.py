from __future__ import annotations

import os
from datetime import datetime


class KafkaClient:
    """
    Minimal Kafka/Redpanda client interface compatible with KafkaClientStub.
    Requires `confluent-kafka` runtime dependency. This file does not install it.
    """

    def __init__(self, brokers: str | None = None, sasl_username: str | None = None,
                 sasl_password: str | None = None, security_protocol: str | None = None,
                 sasl_mechanism: str | None = None):
        try:
            from confluent_kafka import Producer, Consumer, KafkaException  # type: ignore
        except Exception as e:  # pragma: no cover
            raise ImportError("confluent-kafka not available") from e

        self._KafkaException = KafkaException
        self._Producer = Producer
        self._Consumer = Consumer
        self.brokers = brokers or os.getenv('KAFKA_BROKERS', 'localhost:9092')

        config = {
            'bootstrap.servers': self.brokers,
            'client.id': 'bist-ai-backend',
            'queue.buffering.max.messages': 100000,
        }

        # Optional security
        sec_proto = security_protocol or os.getenv('KAFKA_SECURITY_PROTOCOL')
        if sec_proto:
            config['security.protocol'] = sec_proto
        mech = sasl_mechanism or os.getenv('KAFKA_SASL_MECHANISM')
        if mech:
            config['sasl.mechanisms'] = mech
        user = sasl_username or os.getenv('KAFKA_SASL_USERNAME')
        pwd = sasl_password or os.getenv('KAFKA_SASL_PASSWORD')
        if user and pwd:
            config['sasl.username'] = user
            config['sasl.password'] = pwd

        # Lazy create producer only for status/publish demo
        self._producer = self._Producer(config)

    def status(self) -> dict:
        return {
            'brokers': self.brokers,
            'topics': [],
            'status': 'running',
            'consumers': [],
            'timestamp': datetime.now().isoformat(),
        }

    def publish(self, topic: str, count: int) -> dict:
        payload = b'{}'
        for _ in range(max(count, 0)):
            self._producer.produce(topic, payload)
        self._producer.flush()
        return {
            'topic': topic,
            'published': count,
            'acks': 'producer_flush',
            'timestamp': datetime.now().isoformat(),
        }

    def lag(self) -> dict:
        # Real lag requires Admin/Consumer group APIs; return empty for now
        return {'partitions': [], 'total_lag': 0, 'timestamp': datetime.now().isoformat()}

    def latency(self) -> dict:
        # Without tracing, return placeholders
        return {
            'e2e_latency_ms': 0,
            'producer_queue_ms': 0,
            'broker_ms': 0,
            'consumer_ms': 0,
            'timestamp': datetime.now().isoformat(),
        }


