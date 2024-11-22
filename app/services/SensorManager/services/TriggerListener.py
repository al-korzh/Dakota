import asyncio
import asyncpg
from starlette.websockets import WebSocketDisconnect

from app.config import config


class TriggerListener:
    def __init__(self, channel: str, notification_handler):
        self.channel = channel
        self.connection = None
        self.notification_handler = notification_handler

    async def connect(self):
        if self.connection is None:
            self.connection = await asyncpg.connect(dsn=config.DATABASE_URL)
            await self.connection.add_listener(self.channel, self._internal_handle_notification)

    async def disconnect(self):
        if self.connection is not None:
            await self.connection.close()
            self.connection = None

    async def _internal_handle_notification(self, connection, pid, channel, payload):
        try:
            await self.notification_handler(payload)
        except WebSocketDisconnect:
            print("WebSocket disconnected in _internal_handle_notification.")
            await self.disconnect()
        except RuntimeError as e:
            print(f"RuntimeError in notification handling: {e}")
            await self.disconnect()

    async def __call__(self):
        await self.connect()

        try:
            while True:
                await asyncio.sleep(10)
        except Exception as exc:
            print(exc)
        finally:
            await self.disconnect()
