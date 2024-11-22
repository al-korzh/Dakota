import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings


load_dotenv()
if os.getenv("ENV") == "production":
    load_dotenv(".env.production", override=True)
else:
    load_dotenv(".env.development", override=True)


class Config(BaseSettings):
    DEBUG: bool = Field(default=False)
    DATABASE_URL: str = Field()
    PERIOD_METERS: int = Field()
    SECRET_KEY: str = Field()
    ALGORITHM: str = Field()
    SESSION_EXPIRE_MINUTES: int = Field()
    SMTP_HOST: str = Field()
    SMTP_PORT: int = Field()
    SMTP_ADDRESS: str = Field()
    SMTP_PASSWORD: str = Field()

    PROJECT_DIR: Path = Path(__file__).resolve().parent.parent


config = Config()

if config.DEBUG:
    print(config)
