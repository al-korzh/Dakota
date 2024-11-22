import jwt
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta

from app.config import config


def send_email(recipient_email: str, subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = config.SMTP_ADDRESS
    msg["To"] = recipient_email

    try:
        with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=10) as server:
            server.login(config.SMTP_ADDRESS, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_ADDRESS, recipient_email, msg.as_string())
    except smtplib.SMTPException as e:
        print("An error occurred while sending email:", e)


def create_access_token(data: dict):
    data.update({"exp": datetime.now() + timedelta(minutes=config.SESSION_EXPIRE_MINUTES)})
    return jwt.encode(data, config.SECRET_KEY, algorithm=config.ALGORITHM)
