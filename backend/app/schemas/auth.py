from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime
    has_github: bool = False
    github_username: Optional[str] = None
    github_avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuthMeResponse(BaseModel):
    authenticated: bool
    user: Optional[UserOut] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
