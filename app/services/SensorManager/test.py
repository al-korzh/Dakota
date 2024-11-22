import pytest
import asyncio
import pytest_asyncio
from httpx import AsyncClient

from app.main import app


@pytest.fixture(scope='session', autouse=True)
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_sensors(async_client: AsyncClient):
    response = await async_client.post("/sensors", json={
        "id_controller": "0000000001",
        "parameter": {
            "id": 1,
            "name": "температура воды",
            "symbol": "°C",
            "measure": "градусов",
            "min": 0.0,
            "max": 50.0
        },
    })
    assert response.status_code == 200
    _id = response.json()["id"]

    response = await async_client.get(f"/sensors/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get("/sensors")
    assert response.status_code == 200
    result = response.json()
    assert isinstance(result, list)
    assert len(result) > 0

    response = await async_client.put(f"/sensors/{_id}", json={
        "id": _id,
        "id_controller": "0000000001",
        "address": "test_address",
        "parameter": {
            "id": 1,
            "name": "температура воды",
            "symbol": "°C",
            "measure": "градусов",
            "min": 0.0,
            "max": 50.0
        },
    })
    assert response.status_code == 200
    assert response.json()["address"] == "test_address"

    response = await async_client.delete(f"/sensors/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get(f"/sensors/{_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_parameters(async_client: AsyncClient):
    response = await async_client.post("/parameters", json={
        "id": 200,
        "name": "заряд аккумулятора",
        "symbol": "V",
        "measure": "V",
        "min": 3.5,
        "max": 5.2,
    })
    assert response.status_code == 200
    _id = response.json()["id"]

    response = await async_client.get(f"/parameters/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get("/parameters")
    assert response.status_code == 200
    result = response.json()
    assert isinstance(result, list)
    assert len(result) > 0

    response = await async_client.put(f"/parameters/{_id}", json={
        "id": _id,
        "name": "test name",
        "symbol": "V",
        "measure": "V",
        "min": 3.5,
        "max": 5.2,
    })
    assert response.status_code == 200
    result = response.json()
    assert result["name"] == "test name"

    response = await async_client.delete(f"/parameters/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get(f"/parameters/{_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_mount_points(async_client: AsyncClient):
    response = await async_client.post("/mount-points", json={
        "name": "test",
    })
    assert response.status_code == 200
    _id = response.json()["id"]

    response = await async_client.get(f"/mount-points/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get("/mount-points")
    assert response.status_code == 200
    result = response.json()
    assert isinstance(result, list)
    assert len(result) > 0

    response = await async_client.put(f"/mount-points/{_id}", json={
        "id": _id,
        "name": "test name",
    })
    assert response.status_code == 200
    result = response.json()
    assert result["name"] == "test name"

    response = await async_client.delete(f"/mount-points/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get(f"/mount-points/{_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_reports(async_client: AsyncClient):
    data = [
        {
            "id": 1,
            "name": "температура воды",
            "symbol": "°C",
            "measure": "градусов",
            "min": 0.0,
            "max": 50.0
        }
    ]
    response = await async_client.request("GET", "/reports", params={"file_format": "csv"}, json=data)
    assert response.status_code == 200

    assert 'text/csv' in response.headers["content-type"]
    assert "attachment; filename=report.csv" in response.headers["content-disposition"]
    assert len(response.content) > 0

    response = await async_client.request("GET", "/reports", params={"file_format": "xlsx"}, json=data)
    assert response.status_code == 200

    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=report.xlsx" in response.headers["content-disposition"]
    assert len(response.content) > 0

    response = await async_client.request("GET", "/reports", params={"file_format": "pdf"}, json=data)
    assert response.status_code == 200

    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=report.pdf" in response.headers["content-disposition"]
    assert len(response.content) > 0

    response = await async_client.request("GET", "/reports", params={"file_format": "invalid"}, json=data)
    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid format specified"}
