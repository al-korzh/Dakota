from typing import Optional
from pydantic import BaseModel


class ParameterBase(BaseModel):
    name: str
    symbol: str
    measure: str
    min: float
    max: float

    class Config:
        from_attributes = True


class Parameter(ParameterBase):
    id: int

    class Config:
        from_attributes = True


class MountPointBase(BaseModel):
    name: str

    class Config:
        from_attributes = True


class MountPoint(MountPointBase):
    id: int

    class Config:
        from_attributes = True


class SensorBase(BaseModel):
    id_controller: str
    address: Optional[str] = None
    position: Optional[dict] = None
    parameter: Parameter
    mount_point: Optional[MountPoint] = None

    class Config:
        from_attributes = True


class Sensor(SensorBase):
    id: int

    class Config:
        from_attributes = True


class MeasurementsBase(BaseModel):
    time: int
    value: float

    class Config:
        from_attributes = True


class Measurements(MeasurementsBase):
    id: int
    id_sensor: int

    class Config:
        from_attributes = True