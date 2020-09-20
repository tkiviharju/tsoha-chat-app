from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Message(BaseModel):
    id: Optional[int] = None
    content: str
    user_id: int
    channel_id: int
    created: datetime


class Channel(BaseModel):
    id: Optional[int] = None
    name: str


class User(BaseModel):
    id: Optional[int] = None
    username: str
