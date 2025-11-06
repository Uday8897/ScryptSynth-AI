import os
import sys
import logging
import time

# --- THIS IS THE FIX ---
# Add the current directory (AI-Service root) to the Python path
# This allows Python to find the 'app' module
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
# --- END OF FIX ---

# Set up basic logging BEFORE importing other modules
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """
    Entry point for the consumer script.
    Imports and starts the RabbitMQ consumer.
    """
    try:
        # Import the consumer function *after* setting the path
        from app.core.message_broker import start_consuming
        
        logger.info("--- Starting AI-Service RabbitMQ Consumer Process ---")
        start_consuming()
        
    except ImportError as e:
        logger.error(f"CRITICAL: Failed to import modules. Is your `app` directory correct? Error: {e}")
        logger.error("Make sure you are running this script from the 'AI-Service' root directory.")
    except Exception as e:
        logger.error(f"CRITICAL: Consumer process failed to start. Error: {e}", exc_info=True)

if __name__ == "__main__":
    main()