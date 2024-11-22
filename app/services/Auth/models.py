import bcrypt
from sqlalchemy.orm import validates
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, SmallInteger, CHAR


Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(SmallInteger, primary_key=True, autoincrement=True)
    permission = Column(SmallInteger, nullable=False, default=0)
    email = Column(String(50), unique=True, nullable=False)
    telegram_id = Column(Integer)
    password = Column(CHAR(60), nullable=False)

    @validates('permission')
    def validate_permission(self, key, value):
        if value < 0 or value > 255:
            raise ValueError("Permission must be between 0 and 255")
        return value

    @validates('password')
    def hash_password(self, key, password):
        if password:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            return hashed_password.decode('utf-8')
        raise ValueError("Password cannot be empty")

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
