from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "fallback-secret-key")
ALGORITHM = "HS256"

def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    data = {"sub": email, "exp": expire}
    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        return email
    except JWTError:
        return None