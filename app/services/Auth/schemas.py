from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    telegram_id: int
    permission: int = 0


class UserWithPassword(UserBase):
    password: str

    class Config:
        from_attributes = True


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserResetPassword(BaseModel):
    username: EmailStr
