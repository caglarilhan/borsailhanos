import os
import random
from datetime import datetime
from typing import Optional


class KafkaClientStub:
    """Lightweight stub to mimic Kafka/Redpanda client behaviour for demo."""

    def __init__(self, brokers: Optional[str] = None):
        self.brokers = brokers or os.getenv('KAFKA_BROKERS', 'kafka:9092')
        self.topics = ['market.bist.prices', 'market.us.prices']

    def status(self) -> dict:
        return {
            'brokers': self.brokers,
            'topics': self.topics,
            'status': 'running',
            'consumers': [
                {'group': 'web-app', 'lag': random.randint(5, 20)},
                {'group': 'predictive-twin', 'lag': random.randint(0, 6)},
            ],
            'timestamp': datetime.now().isoformat(),
        }

    def publish(self, topic: str, count: int) -> dict:
        return {
            'topic': topic,
            'published': count,
            'acks': 'all',
            'timestamp': datetime.now().isoformat(),
        }

    def lag(self) -> dict:
        parts = [
            {'topic': 'market.bist.prices', 'partition': 0, 'lag': random.randint(0, 8)},
            {'topic': 'market.bist.prices', 'partition': 1, 'lag': random.randint(0, 10)},
            {'topic': 'market.us.prices', 'partition': 0, 'lag': random.randint(0, 5)},
        ]
        return {
            'partitions': parts,
            'total_lag': sum(p['lag'] for p in parts),
            'timestamp': datetime.now().isoformat(),
        }

    def latency(self) -> dict:
        return {
            'e2e_latency_ms': int(random.uniform(80, 450)),
            'producer_queue_ms': int(random.uniform(5, 40)),
            'broker_ms': int(random.uniform(15, 120)),
            'consumer_ms': int(random.uniform(20, 160)),
            'timestamp': datetime.now().isoformat(),
        }


