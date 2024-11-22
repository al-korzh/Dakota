import random
from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import time

from app.config import config
from app.services.SensorManager.models import Sensor, Measurements, Parameter

fake = Faker()
BATCH_SIZE = 1000
START_DATE_AGO = 180
INTERVAL_MINUTES = 10
REALTIME_INTERVAL_SECONDS = 5

def generate_synthetic_measurements_for_sensor(sensor, start_time, end_time, interval_minutes=5):
    """Генерация синтетических данных для сенсора за заданный период с интервалом времени."""
    measurements = []
    current_time = start_time
    while current_time <= end_time:
        measurement = Measurements(
            id_sensor=sensor.id,
            timestamp=int(current_time.timestamp()),
            value=round(random.uniform(float(sensor.parameter.min), float(sensor.parameter.max)), 2)
        )

        measurements.append(measurement)
        current_time += timedelta(minutes=interval_minutes)

        if len(measurements) >= BATCH_SIZE:
            yield measurements
            measurements = []

    if measurements:
        yield measurements

def add_realtime_measurement(session, sensor):
    """Добавление одной записи измерения для сенсора в реальном времени."""
    value = round(random.uniform(float(sensor.parameter.min), float(sensor.parameter.max)), 2)
    timestamp = int(datetime.now().timestamp())

    measurement = Measurements(
        id_sensor=sensor.id,
        timestamp=timestamp,
        value=value
    )
    session.add(measurement)
    print(f"Added realtime measurement for sensor {sensor.id}: value={value}, timestamp={timestamp}")

def main():
    """Основная функция: генерация синтетических данных и добавление данных в реальном времени."""
    engine = create_engine(config.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Удаление старых данных
    session.query(Measurements).delete()
    session.commit()

    # Установка временных границ для синтетических данных
    end_time = datetime.now()
    start_time = end_time - timedelta(days=START_DATE_AGO)

    # Генерация синтетических данных для каждого сенсора
    sensors = session.query(Sensor).all()
    for sensor in sensors:
        for sensor_batch in generate_synthetic_measurements_for_sensor(sensor, start_time, end_time, INTERVAL_MINUTES):
            session.add_all(sensor_batch)
            session.commit()
            print(f"Inserted batch of {len(sensor_batch)} measurements for sensor {sensor.id}")

    print("Synthetic data generation complete.")

    # Цикл для генерации данных в реальном времени
    try:
        while True:
            for sensor in sensors:
                add_realtime_measurement(session, sensor)
            session.commit()
            time.sleep(REALTIME_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        print("Realtime data generation stopped.")
    finally:
        session.close()

# Запуск скрипта
if __name__ == "__main__":
    main()
