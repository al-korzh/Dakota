from sqlalchemy import update
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile

from app.config import config
from app.database import get_db
from app.services.SensorManager import models

router = APIRouter()


@router.get("/map")
async def read_map():
    if not (config.PROJECT_DIR / 'map.svg').is_file():
        raise HTTPException(status_code=404, detail="Map not found")

    return FileResponse(
        config.PROJECT_DIR / 'map.svg',
        headers={
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.post("/map")
async def create_map(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(".svg"):
        raise HTTPException(status_code=400, detail="File must be an SVG.")

    await db.execute(
        update(models.Sensor).values(position=None)
    )
    await db.commit()

    with open(config.PROJECT_DIR / 'map.svg', "wb") as buffer:
        buffer.write(await file.read())

    return FileResponse(
        config.PROJECT_DIR / 'map.svg',
        headers={
            "Access-Control-Allow-Origin": "*",
        }
    )
