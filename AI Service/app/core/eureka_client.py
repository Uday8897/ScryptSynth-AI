import py_eureka_client.eureka_client as eureka_client
from app.config.settings import settings
import asyncio

async def init_eureka():
    """
    Initializes and registers the service with the Eureka server.
    """
    try:
        print("Initializing Eureka client...")
        await eureka_client.init_async(
            eureka_server=settings.EUREKA_SERVER,
            app_name=settings.SERVICE_NAME,
            instance_port=settings.SERVICE_PORT,
            instance_host=settings.SERVICE_HOST,
            # You can add more metadata if needed
            metadata={"service-type": "ai-engine"}
        )
        print(f"Service '{settings.SERVICE_NAME}' registered with Eureka at {settings.EUREKA_SERVER}")
    except Exception as e:
        print(f"Could not register with Eureka: {e}")

async def stop_eureka():
    """
    De-registers the service from Eureka.
    """
    print("De-registering from Eureka...")
    await eureka_client.stop_async()
    print("Service de-registered.")