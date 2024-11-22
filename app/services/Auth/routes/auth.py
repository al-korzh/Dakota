import jwt
import secrets
from jwt import PyJWTError
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException, Response, Request

from app.config import config
from app.database import get_db
from app.services.Auth import utils
from app.services.Auth import models
from app.services.Auth import schemas


router = APIRouter()


@router.post("/auth/login", response_model=schemas.User)
async def auth(response: Response, data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.email == data.username))
    user = query.scalars().first()

    if user is None or not user.check_password(data.password):
        raise HTTPException(status_code=404, detail="Incorrect username or password")

    token = utils.create_access_token(data={"sub": user.email})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=config.SESSION_EXPIRE_MINUTES * 60,
        secure=not config.DEBUG,
        samesite="strict",
    )

    return user


@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"status": "success"}


@router.post("/auth/check", response_model=schemas.User)
async def check(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        token = utils.create_access_token(data={"sub": username})
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=config.SESSION_EXPIRE_MINUTES * 60,
            secure=not config.DEBUG,
            samesite="strict",
        )

        query = await db.execute(select(models.User).filter(models.User.email == username))
        user = query.scalars().first()

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")



@router.post("/auth/reset-password")
async def reset_password(data: schemas.UserResetPassword, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.User).filter(models.User.email == data.username))
    user = query.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    new_password = secrets.token_hex(8)
    user.password = new_password

    await db.commit()
    await db.refresh(user)

    utils.send_email(data.username, "Password Reset Request", f"Your new password is: {new_password}")

    return {"status": "success"}
