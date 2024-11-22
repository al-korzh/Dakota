from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services.Auth import utils
from app.services.Auth import models
from app.services.Auth import schemas


router = APIRouter()


@router.get("/users", response_model=List[schemas.User])
async def read_users(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User))
    return query.scalars().all()


@router.get("/users/{id}", response_model=schemas.User)
async def read_user(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.id == id))
    user = query.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail=f"User with ID {id} not found")

    return user


@router.post("/users", response_model=schemas.User)
async def create_user(data: schemas.UserWithPassword, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.email == data.email))
    user = query.scalars().first()

    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=data.email,
        password=data.password,
        telegram_id=data.telegram_id,
        permission=data.permission
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.put("/users/{id}", response_model=schemas.User)
async def update_user(id: int, data: schemas.UserWithPassword, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.id == id))
    user = query.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail=f"User with ID {id} not found")

    user.email = data.email
    user.password = data.password
    user.telegram_id = data.telegram_id
    user.permission = data.permission

    await db.commit()
    await db.refresh(user)

    utils.send_email(data.email, "Password Reset Request", f"Your new password is: {data.password}")

    return user


@router.delete("/users/{id}", response_model=schemas.User)
async def delete_user(id: int, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.id == id))
    user = query.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail=f"User with ID {id} not found")

    await db.delete(user)
    await db.commit()

    return user
