from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, JSON, SmallInteger, CHAR, Numeric, BigInteger, ForeignKey


Base = declarative_base()


class Sensor(Base):
    __tablename__ = 'sensor'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_parameter = Column(SmallInteger, ForeignKey('parameter.id'), index=True, nullable=False)
    id_mount_point = Column(Integer, ForeignKey('mount_point.id', ondelete='SET NULL'), index=True)
    id_controller = Column(CHAR(10), nullable=False)
    address = Column(String(42))
    position = Column(JSON)

    meter = relationship("Measurements", back_populates="sensor")
    parameter = relationship("Parameter", back_populates="sensor")
    mount_point = relationship("MountPoint", back_populates="sensor")


class Parameter(Base):
    __tablename__ = 'parameter'

    id = Column(SmallInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(40), nullable=False)
    symbol = Column(String(10), nullable=False)
    measure = Column(String(20), nullable=False)
    min = Column(Numeric(7, 2), nullable=False)
    max = Column(Numeric(7, 2), nullable=False)

    sensor = relationship("Sensor", back_populates="parameter")


class MountPoint(Base):
    __tablename__ = 'mount_point'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    sensor = relationship("Sensor", back_populates="mount_point")


class Measurements(Base):
    __tablename__ = 'meter'

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    id_sensor = Column(Integer, ForeignKey('sensor.id'), index=True)
    timestamp = Column(Integer, nullable=False)
    value = Column(Numeric(7, 2), nullable=False)

    sensor = relationship("Sensor", back_populates="meter")
