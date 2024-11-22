from fastapi import APIRouter

from .models import Base
from .routes import auth, users
from app.database import init_db


app = APIRouter()
app.include_router(auth.router)
app.include_router(users.router)


@app.on_event("startup")
async def startup():
    await init_db(Base)
