from pydantic import BaseModel
from typing import Optional

class Message(BaseModel):
	id: Optional[int] = None
	content: str
	user_id: int
	channel_id: int

class Channel(BaseModel):
	id: Optional[int] = None
	name: str

class User(BaseModel):
	id: Optional[int] = None
	username: str