import csv
from io import BytesIO, StringIO
from openpyxl import Workbook
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy import func, asc
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import config
from app.database import get_db
from app.services.SensorManager import models


router = APIRouter()
pdfmetrics.registerFont(TTFont('TimesNewRoman', config.PROJECT_DIR / 'Times New Roman.ttf'))


@router.get("/reports/mount-points")
async def read_reports_fby_mount_points(
    ids: str = Query(),
    start: int = Query(None),
    end: int = Query(None),
    file_format: str = Query(None, enum=['csv', 'xlsx', 'pdf']),
    db: AsyncSession = Depends(get_db)
):
    if file_format not in ['csv', 'xlsx', 'pdf']:
        raise HTTPException(status_code=422, detail="Invalid format specified")

    file_columns = ['ТМ', 'Параметр', 'Адрес', 'Дата+время', 'Значение']

    query = (
        select(
            models.MountPoint.name,
            models.Parameter.name,
            models.Sensor.address,
            func.to_char(func.to_timestamp(models.Measurements.timestamp), 'YYYY-MM-DD HH24:MI:SS').label('timestamp'),
            models.Measurements.value,
        )
        .join(models.Sensor, models.Measurements.id_sensor == models.Sensor.id)
        .join(models.Parameter, models.Sensor.id_parameter == models.Parameter.id)
        .join(models.MountPoint, models.Sensor.id_mount_point == models.MountPoint.id)
        .filter(models.Sensor.id_mount_point.in_([int(_id) for _id in ids.split(",")]))
        .order_by(asc('timestamp'))
    )

    if start:
        query = query.filter(models.Measurements.timestamp >= start)
    if end:
        query = query.filter(models.Measurements.timestamp <= end)

    measurements = await db.execute(query)
    measurements = measurements.all()

    measurements = [[cell if cell is not None else '' for cell in row] for row in measurements]

    if file_format == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(file_columns)
        for row in measurements:
            writer.writerow(row)

        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={
            "Content-Disposition": "attachment; filename=report.csv"
        })

    elif file_format == 'xlsx':
        output = BytesIO()
        wb = Workbook()
        ws = wb.active
        ws.append(file_columns)
        for row in measurements:
            ws.append(list(row))

        wb.save(output)
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                 headers={"Content-Disposition": "attachment; filename=report.xlsx"})

    elif file_format == 'pdf':
        output = BytesIO()
        p = canvas.Canvas(output, pagesize=letter)
        width, height = letter
        p.setFont("TimesNewRoman", 10)

        x_offset = 50
        y_offset = height - 50
        line_height = 15

        # Вычисляем ширину для каждой колонки, равномерно распределяя доступное пространство
        num_columns = len(file_columns)
        column_width = (width - 2 * x_offset) / num_columns

        # Рисуем заголовки колонок
        for i, column in enumerate(file_columns):
            p.drawString(x_offset + i * column_width, y_offset, column)

        # Переходим на следующую строку
        y_offset -= line_height

        # Рисуем строки данных
        for row in measurements:
            for i, cell in enumerate(row):
                p.drawString(x_offset + i * column_width, y_offset, str(cell))
            y_offset -= line_height

            if y_offset < 40:
                p.showPage()
                p.setFont("TimesNewRoman", 10)
                y_offset = height - 50

        p.save()
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf",
                                 headers={"Content-Disposition": "attachment; filename=report.pdf"})


@router.get("/reports/parameters")
async def read_reports_fby_parameters(
    ids: str = Query(),
    start: int = Query(None),
    end: int = Query(None),
    file_format: str = Query(None, enum=['csv', 'xlsx', 'pdf']),
    db: AsyncSession = Depends(get_db)
):
    if file_format not in ['csv', 'xlsx', 'pdf']:
        raise HTTPException(status_code=422, detail="Invalid format specified")

    file_columns = ['ТМ', 'Параметр', 'Адрес', 'Дата+время', 'Значение']

    query = (
        select(
            models.MountPoint.name,
            models.Parameter.name,
            models.Sensor.address,
            func.to_char(func.to_timestamp(models.Measurements.timestamp), 'YYYY-MM-DD HH24:MI:SS').label('timestamp'),
            models.Measurements.value,
        )
        .join(models.Sensor, models.Measurements.id_sensor == models.Sensor.id)
        .join(models.Parameter, models.Sensor.id_parameter == models.Parameter.id)
        .join(models.MountPoint, models.Sensor.id_mount_point == models.MountPoint.id)
        .filter(models.Sensor.id_parameter.in_([int(_id) for _id in ids.split(",")]))
        .order_by(asc('timestamp'))
    )

    if start:
        query = query.filter(models.Measurements.timestamp >= start)
    if end:
        query = query.filter(models.Measurements.timestamp <= end)

    measurements = await db.execute(query)
    measurements = measurements.all()

    measurements = [[cell if cell is not None else '' for cell in row] for row in measurements]

    if file_format == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(file_columns)
        for row in measurements:
            writer.writerow(row)

        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={
            "Content-Disposition": "attachment; filename=report.csv"
        })

    elif file_format == 'xlsx':
        output = BytesIO()
        wb = Workbook()
        ws = wb.active
        ws.append(file_columns)
        for row in measurements:
            ws.append(list(row))

        wb.save(output)
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                 headers={"Content-Disposition": "attachment; filename=report.xlsx"})

    elif file_format == 'pdf':
        output = BytesIO()
        p = canvas.Canvas(output, pagesize=letter)
        width, height = letter
        p.setFont("TimesNewRoman", 10)

        x_offset = 50
        y_offset = height - 50
        line_height = 15

        # Вычисляем ширину для каждой колонки, равномерно распределяя доступное пространство
        num_columns = len(file_columns)
        column_width = (width - 2 * x_offset) / num_columns

        # Рисуем заголовки колонок
        for i, column in enumerate(file_columns):
            p.drawString(x_offset + i * column_width, y_offset, column)

        # Переходим на следующую строку
        y_offset -= line_height

        # Рисуем строки данных
        for row in measurements:
            for i, cell in enumerate(row):
                p.drawString(x_offset + i * column_width, y_offset, str(cell))
            y_offset -= line_height

            if y_offset < 40:
                p.showPage()
                p.setFont("TimesNewRoman", 10)
                y_offset = height - 50

        p.save()
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf",
                                 headers={"Content-Disposition": "attachment; filename=report.pdf"})
