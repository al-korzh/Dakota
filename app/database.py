from typing import Type
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.config import config

engine = create_async_engine(config.DATABASE_URL.replace("postgresql", "postgresql+asyncpg"))
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


async def init_db(models: Type[DeclarativeBase]) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(models.metadata.create_all)
