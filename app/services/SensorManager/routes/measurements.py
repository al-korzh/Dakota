import json
from typing import List, Dict
from sqlalchemy import select, func
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import WebSocket,Query, APIRouter, Depends
from starlette.websockets import WebSocketDisconnect

from app.config import config
from app.database import get_db
from app.services.SensorManager import models
from app.services.SensorManager import schemas
from app.services.SensorManager.services.TriggerListener import TriggerListener

router = APIRouter()


@router.websocket("/measurements/notifications/{_id}")
async def websocket_endpoint(_id: int, websocket: WebSocket):
    await websocket.accept()

    async def handle_message(payload: str):
        try:
            data = json.loads(payload)
            sensor_id = data['data'].get('id_sensor')

            if sensor_id == _id:
                await websocket.send_text(json.dumps({
                    "time": data['data']['timestamp'],
                    "value": data['data']['value']
                }))

        except WebSocketDisconnect:
            print("WebSocket disconnected in handle_message.")
            raise

    listener = TriggerListener("measurements_channel", handle_message)

    try:
        await listener()
    except WebSocketDisconnect:
        print("WebSocket disconnected in endpoint.")
    finally:
        await websocket.close()


@router.get("/measurements/mount-point/{_id}", response_model=Dict[str, List[schemas.MeasurementsBase]])
async def read_measurements_fby_mount_point(
    _id: int,
    end: int = Query(None),
    interval: int = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = await db.execute(select(models.Sensor.id).filter(models.Sensor.id_mount_point == _id))
    sensors = query.scalars().all()

    if end:
        end = datetime.fromtimestamp(end)
    else:
        end = datetime.now()
    start = end - timedelta(days=config.PERIOD_METERS)

    if interval:
        timestamp = (models.Measurements.timestamp // interval * interval).label('timestamp')
    else:
        timestamp = models.Measurements.timestamp

    subquery = (
        select(
            models.Parameter.name.label("name"),
            timestamp,
            func.round(func.avg(models.Measurements.value), 2).label('value')
        )
        .join(models.Sensor, models.Measurements.id_sensor == models.Sensor.id)
        .join(models.Parameter, models.Sensor.id_parameter == models.Parameter.id)
        .filter(
            models.Measurements.id_sensor.in_(sensors),
            models.Measurements.timestamp >= start.timestamp(),
            models.Measurements.timestamp < end.timestamp(),
        )
        .group_by(models.Parameter.name, timestamp)
        .subquery()
    )

    query = await db.execute(
        select(
            subquery.c.name,
            func.json_agg(
                func.json_build_object(
                    'time', subquery.c.timestamp,
                    'value', subquery.c.value
                )
            ).label('measurements')
        )
        .group_by(subquery.c.name)
    )

    response = {row.name: row.measurements for row in query}

    return response


@router.get("/measurements/parameter/{_id}", response_model=Dict[str, List[schemas.MeasurementsBase]])
async def read_measurements_fby_parameter(
    _id: int,
    end: int = Query(None),
    interval: int = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = await db.execute(select(models.Sensor.id).filter(models.Sensor.id_parameter == _id))
    sensors = query.scalars().all()

    if end:
        end = datetime.fromtimestamp(end)
    else:
        end = datetime.now()
    start = end - timedelta(days=config.PERIOD_METERS)

    if interval:
        timestamp = (models.Measurements.timestamp // interval * interval).label('timestamp')
    else:
        timestamp = models.Measurements.timestamp

    subquery = (
        select(
            models.MountPoint.name.label("name"),
            timestamp,
            func.round(func.avg(models.Measurements.value), 2).label('value')
        )
        .join(models.Sensor, models.Measurements.id_sensor == models.Sensor.id)
        .join(models.MountPoint, models.Sensor.id_mount_point == models.MountPoint.id)
        .filter(
            models.Measurements.id_sensor.in_(sensors),
            models.Measurements.timestamp >= start.timestamp(),
            models.Measurements.timestamp < end.timestamp(),
        )
        .group_by(models.MountPoint.name, timestamp)
        .subquery()
    )

    query = await db.execute(
        select(
            subquery.c.name,
            func.json_agg(
                func.json_build_object(
                    'time', subquery.c.timestamp,
                    'value', subquery.c.value
                )
            ).label('measurements')
        )
        .group_by(subquery.c.name)
    )

    response = {row.name: row.measurements for row in query}

    return response
