from typing import List
from sqlalchemy import update
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services.SensorManager import models
from app.services.SensorManager import schemas


router = APIRouter()


@router.get("/mount-points", response_model=List[schemas.MountPoint])
async def read_mount_points(db: AsyncSession = Depends(get_db)):
    query = await db.execute(
        select(models.MountPoint)
    )
    return query.scalars().all()


@router.get("/mount-points/{id}", response_model=schemas.MountPoint)
async def read_mount_point(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == id))
    mount_point = query.scalars().first()

    if mount_point is None:
        raise HTTPException(status_code=404, detail=f"MountPoint with ID {id} not found")

    return mount_point


@router.post("/mount-points", response_model=schemas.MountPoint)
async def create_mount_point(data: schemas.MountPointBase, db: AsyncSession = Depends(get_db)):
    mount_point = models.MountPoint(
        name=data.name,
    )

    db.add(mount_point)
    await db.commit()
    await db.refresh(mount_point)

    return mount_point


@router.put("/mount-points/{id}", response_model=schemas.MountPoint)
async def update_mount_point(id: int, data: schemas.MountPoint, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == id))
    mount_point = query.scalars().first()

    if mount_point is None:
        raise HTTPException(status_code=404, detail=f"MountPoint with ID {id} not found")

    mount_point.name = data.name

    await db.commit()
    await db.refresh(mount_point)

    return mount_point


@router.delete("/mount-points/{id}", response_model=schemas.MountPoint)
async def delete_mount_point(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == id))
    mount_point = query.scalars().first()

    if mount_point is None:
        raise HTTPException(status_code=404, detail=f"MountPoint with ID {id} not found")

    await db.execute(
        update(models.Sensor).
        where(models.Sensor.id_mount_point == id).
        values(position=None)
    )

    await db.delete(mount_point)
    await db.commit()

    return mount_point
