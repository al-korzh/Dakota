import random
from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import config
from app.services.Auth.models import User


fake = Faker()
NUM_USERS_TO_CREATE = 100

engine = create_engine(config.DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

session.query(User).filter(User.id != 1).delete()
for _ in range(NUM_USERS_TO_CREATE):
    email = fake.unique.email()
    password = fake.password(length=10)
    permission = random.randint(0, 255)
    telegram_id = fake.random_number(digits=9, fix_len=True)

    new_user = User(
        email=email,
        password=password,
        permission=permission,
        telegram_id=telegram_id
    )

    session.add(new_user)

session.commit()

print(f"Создано {NUM_USERS_TO_CREATE} пользователей!")
