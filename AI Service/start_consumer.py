# This script is intended to be run as a separate process
# to listen for RabbitMQ messages continuously.
from app.core.message_broker import start_consuming

if __name__ == "__main__":
    start_consuming()