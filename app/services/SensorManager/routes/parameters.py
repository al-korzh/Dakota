from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services.SensorManager import models
from app.services.SensorManager import schemas


router = APIRouter()

@router.get("/parameters", response_model=List[schemas.Parameter])
async def read_parameters(db: AsyncSession = Depends(get_db)):
    query = await db.execute(
        select(models.Parameter)
        .join(models.Sensor)
        .filter(
            models.Sensor.id_mount_point != None,
        )
        .distinct()
    )

    return query.scalars().all()


@router.get("/parameters/{id}", response_model=schemas.Parameter)
async def read_parameter(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Parameter).filter(models.Parameter.id == id))
    parameter = query.scalars().first()

    if parameter is None:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {id} not found")

    return parameter


@router.post("/parameters", response_model=schemas.Parameter)
async def create_parameter(data: schemas.Parameter, db: AsyncSession = Depends(get_db)):
    parameter = models.Parameter(
        id=data.id,
        name=data.name,
        symbol=data.symbol,
        measure=data.measure,
        min=data.min,
        max=data.max,
    )

    db.add(parameter)
    await db.commit()
    await db.refresh(parameter)

    return parameter


@router.put("/parameters/{id}", response_model=schemas.Parameter)
async def update_parameter(id: int, data: schemas.ParameterBase, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Parameter).filter(models.Parameter.id == id))
    parameter = query.scalars().first()

    if parameter is None:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {id} not found")

    parameter.name = data.name
    parameter.symbol = data.symbol
    parameter.measure = data.measure
    parameter.min = data.min
    parameter.max = data.max

    await db.commit()
    await db.refresh(parameter)

    return parameter


@router.delete("/parameters/{id}", response_model=schemas.Parameter)
async def delete_parameter(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Parameter).filter(models.Parameter.id == id))
    parameter = query.scalars().first()

    if parameter is None:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {id} not found")

    await db.delete(parameter)
    await db.commit()

    return parameter
