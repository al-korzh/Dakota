from typing import List
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import WebSocket, APIRouter, Depends, HTTPException
from starlette.websockets import WebSocketDisconnect

from app.database import get_db
from app.services.SensorManager import models
from app.services.SensorManager import schemas
from app.services.SensorManager.services.TriggerListener import TriggerListener


router = APIRouter()


@router.websocket("/sensors/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    async def handle_message(payload: str):
        await websocket.send_text(payload)

    listener = TriggerListener("sensor_channel", handle_message)

    try:
        await listener()
    except WebSocketDisconnect:
        print("WebSocket disconnected in endpoint.")
    finally:
        await websocket.close()


@router.get("/sensors", response_model=List[schemas.Sensor])
async def read_sensors(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Sensor).options(
        selectinload(models.Sensor.parameter),
        selectinload(models.Sensor.mount_point)
    ))
    return query.scalars().all()


@router.get("/sensors/{id}", response_model=schemas.Sensor)
async def read_sensor(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Sensor).filter(models.Sensor.id == id).options(
        selectinload(models.Sensor.parameter),
        selectinload(models.Sensor.mount_point)
    ))
    sensor = query.scalars().first()

    if sensor is None:
        raise HTTPException(status_code=404, detail=f"Sensor with ID {id} not found")

    return sensor

  
@router.post("/sensors", response_model=schemas.Sensor)
async def create_sensor(data: schemas.SensorBase, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Parameter).filter(models.Parameter.id == data.parameter.id))
    parameter = query.scalars().first()

    if not parameter:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {data.parameter.id} not found")

    mount_point = None
    if data.mount_point:
        query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == data.mount_point.id))
        mount_point = query.scalars().first()
        if not mount_point:
            raise HTTPException(status_code=404, detail=f"MountPoint with ID {data.mount_point.id} not found")

    sensor = models.Sensor(
        id_controller=data.id_controller,
        address=data.address,
        position=data.position,
        id_parameter=parameter.id,
        id_mount_point=mount_point.id if mount_point else None
    )

    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)

    _ = sensor.parameter
    _ = sensor.mount_point

    return sensor


@router.put("/sensors/{id}", response_model=schemas.Sensor)
async def update_sensor(id: int, data: schemas.Sensor, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Sensor).filter(models.Sensor.id == id).options(
        selectinload(models.Sensor.parameter),
        selectinload(models.Sensor.mount_point)
    ))
    sensor = query.scalars().first()

    if sensor is None:
        raise HTTPException(status_code=404, detail=f"Sensor with ID {id} not found")

    query = await db.execute(select(models.Parameter).filter(models.Parameter.id == data.parameter.id))
    parameter = query.scalars().first()
    if parameter is None:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {data.parameter.id} not found")

    mount_point = None
    if data.mount_point:
        query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == data.mount_point.id))
        mount_point = query.scalars().first()
        if not mount_point:
            raise HTTPException(status_code=404, detail=f"MountPoint with ID {data.mount_point.id} not found")

    sensor.address = data.address
    sensor.position = data.position
    sensor.id_controller = data.id_controller
    sensor.id_parameter = parameter.id
    sensor.id_mount_point = mount_point.id if mount_point else None

    await db.commit()
    await db.refresh(sensor)

    return sensor


@router.put("/sensors", response_model=List[schemas.Sensor])
async def update_sensors(data: List[schemas.Sensor], db: AsyncSession = Depends(get_db)):
    sensors = []

    for _sensor in data:
        query = await db.execute(select(models.Sensor).filter(models.Sensor.id == _sensor.id).options(
            selectinload(models.Sensor.parameter),
            selectinload(models.Sensor.mount_point)
        ))
        sensor = query.scalars().first()

        if sensor is None:
            raise HTTPException(status_code=404, detail=f"Sensor with ID {_sensor.id} not found")

        query = await db.execute(select(models.Parameter).filter(models.Parameter.id == sensor.parameter.id))
        parameter = query.scalars().first()
        if parameter is None:
            raise HTTPException(status_code=404, detail=f"Parameter with ID {sensor.parameter.id} not found")

        mount_point = None
        if _sensor.mount_point:
            query = await db.execute(select(models.MountPoint).filter(models.MountPoint.id == sensor.mount_point.id))
            mount_point = query.scalars().first()
            if not mount_point:
                raise HTTPException(status_code=404, detail=f"MountPoint with ID {sensor.mount_point.id} not found")

        sensor.address = _sensor.address
        sensor.position = _sensor.position
        sensor.id_controller = _sensor.id_controller
        sensor.id_parameter = parameter.id
        sensor.id_mount_point = mount_point.id if mount_point else None

        await db.commit()
        await db.refresh(sensor)
        sensors.append(sensor)

    return sensors

 
@router.delete("/sensors/{id}", response_model=schemas.Sensor)
async def delete_sensor(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.Sensor).filter(models.Sensor.id == id).options(
        selectinload(models.Sensor.parameter),
        selectinload(models.Sensor.mount_point)
    ))
    sensor = query.scalars().first()

    if sensor is None:
        raise HTTPException(status_code=404, detail=f"Sensor with ID {id} not found")

    await db.delete(sensor)
    await db.commit()

    return sensor
