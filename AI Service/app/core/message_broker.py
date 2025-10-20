import pika
import json  # Make sure this import is at the top
from app.config.settings import settings
from app.services.memory_service import MemoryService

def start_consuming():
    """
    Connects to RabbitMQ and starts consuming messages from the queue.
    This function will run in a separate process.
    """
    print("Starting RabbitMQ consumer...")
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=settings.RABBITMQ_HOST))
    channel = connection.channel()
    
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
    
    memory_service = MemoryService()

    # ==========================================================
    # PASTE THE NEW, ROBUST CALLBACK FUNCTION HERE
    # ==========================================================
    def callback(ch, method, properties, body):
        """
        This function is executed whenever a message is received.
        It's robust against empty or malformed JSON messages.
        """
        print(f" [x] Received message from RabbitMQ")
        try:
            # First, decode the message from bytes to a string
            message_body_str = body.decode('utf-8')

            # Check for an empty message body right away
            if not message_body_str.strip():
                print(" [!] Received an empty message. Acknowledging and discarding.")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            # Now, try to parse the JSON
            message_data = json.loads(message_body_str)
            user_id = message_data.get("userId")
            content = message_data.get("content")
            
            if user_id and content:
                memory_service.add_memory(user_id=user_id, text_content=content)
                print(f" [+] Successfully processed and added memory for user: {user_id}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
            else:
                print(" [!] Message missing 'userId' or 'content'. Acknowledging and discarding.")
                ch.basic_ack(delivery_tag=method.delivery_tag)

        except json.JSONDecodeError:
            # This will catch malformed JSON that isn't just an empty string
            print(f" [!] Failed to decode JSON. Discarding malformed message.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            # Catch any other unexpected errors
            print(f" [!] An unexpected error occurred: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=settings.RABBITMQ_QUEUE, on_message_callback=callback)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()