import pika
import json
import time
import logging
import sys
from app.config.settings import settings
from app.services.memory_service import MemoryService

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - [Consumer] - %(message)s')
logger = logging.getLogger(__name__)

def connect_rabbitmq(retries=5, delay=5):
    """Try to connect to RabbitMQ with retry mechanism."""
    for attempt in range(1, retries + 1):
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    heartbeat=600,
                    blocked_connection_timeout=300
                )
            )
            logger.info("✅ Connected to RabbitMQ successfully.")
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"⚠️ RabbitMQ connection failed (attempt {attempt}/{retries}): {e}")
            time.sleep(delay * attempt) # Exponential backoff
            
    logger.error(f"❌ Failed to connect to RabbitMQ after {retries} attempts.")
    raise RuntimeError("❌ Failed to connect to RabbitMQ.")


def start_consuming():
    """
    RabbitMQ consumer that listens for user activity events and stores them in Supabase memory.
    """
    logger.info("🚀 Starting RabbitMQ consumer...")

    try:
        memory_service = MemoryService()
        logger.info("✅ MemoryService initialized successfully.")
    except Exception as e:
        logger.error(f"💥 FATAL: Consumer could not initialize MemoryService (check Supabase/model?): {e}", exc_info=True)
        return # Cannot run without memory service

    connection = None
    try:
        connection = connect_rabbitmq()
        channel = connection.channel()
        
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
        channel.basic_qos(prefetch_count=1) # Only fetch 1 message at a time

        def callback(ch, method, properties, body):
            """Process incoming AMQP events."""
            try:
                message_data = json.loads(body.decode("utf-8"))
                
                # Extract data from the Java DTO
                user_id = message_data.get("userId")
                content_id = message_data.get("contentId")
                rating = message_data.get("rating")
                review_text = message_data.get("reviewText")
                # Use contentId as a fallback for movie title if not provided
                content_title = message_data.get("contentTitle", f"MovieID_{content_id}") 

                
                if not user_id or not content_id:
                    logger.warning(f"⚠️ Received invalid message (missing userId or contentId): {message_data}")
                    ch.basic_ack(delivery_tag=method.delivery_tag) # Acknowledge and discard
                    return

                logger.info(f"📨 Received event for user={user_id}, contentId={content_id}")

                # --- THIS IS THE FIX ---
                # Changed 'movie_id=content_id' to 'movie_title=content_title'
                # to match the function definition in MemoryService
                memory_service.add_user_review(
                    user_id=str(user_id),
                    movie_title=content_title, # Use the extracted title
                    review_text=review_text or "No review text provided.",
                    rating=float(rating) if rating is not None else None
                )
                # --- END OF FIX ---

                ch.basic_ack(delivery_tag=method.delivery_tag)
                logger.info(f"✅ Processed event for user {user_id}")

            except json.JSONDecodeError:
                logger.error(f"❌ Failed to decode JSON from message. Body: {body.decode('utf-8')}")
                ch.basic_ack(delivery_tag=method.delivery_tag) # Discard bad message
            except Exception as e:
                logger.error(f"❌ Error processing RabbitMQ message: {e}", exc_info=True)
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                time.sleep(5)

        channel.basic_consume(
            queue=settings.RABBITMQ_QUEUE,
            on_message_callback=callback,
            auto_ack=False # We handle acknowledgements manually
        )

        logger.info(f"🎯 Waiting for events on queue '{settings.RABBITMQ_QUEUE}'...")
        channel.start_consuming()

    except Exception as e:
        logger.error(f"❌ RabbitMQ consumer fatal error: {e}", exc_info=True)
    finally:
        if connection and connection.is_open:
            connection.close()
            logger.info("🔒 RabbitMQ connection closed.")

def start_rabbitmq_consumer():
    """Thread-safe entry point (used in main.py)"""
    logger.info("🚀 Launching RabbitMQ background consumer...")
    start_consuming()