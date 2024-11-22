from fastapi import APIRouter

from app.database import init_db
from .models import Base
from .routes import map, reports, sensors, parameters, mount_points, measurements


app = APIRouter()
app.include_router(map.router)
app.include_router(reports.router)
app.include_router(sensors.router)
app.include_router(parameters.router)
app.include_router(mount_points.router)
app.include_router(measurements.router)


@app.on_event("startup")
async def startup():
    await init_db(Base)
