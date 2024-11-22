from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.Auth import main as Auth
from app.services.SensorManager import main as SensorManager


app = FastAPI()
app.include_router(Auth.app)
app.include_router(SensorManager.app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://10.66.66.29",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.66.66.29:3000",
        "http://10.82.171.143:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
