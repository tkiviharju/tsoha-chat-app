from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from typing import List

from schemas import Message, Channel, User
from db.client import get_db_client
from db.tables import message_table, channel_table, user_table
from sqlalchemy.sql import select


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


app = FastAPI()
db = get_db_client()
manager = ConnectionManager()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/messages")
async def get_messages() -> List[Message]:
    with db.connect() as connection:
        get_all_messages = message_table.select()
        messages = connection.execute(get_all_messages)

        return list(messages)


@app.get("/messages/{message_id}")
async def get_one_message(message_id: int) -> Message:
    with db.connect() as connection:
        get_message = select([message_table]).where(message_table.c.id == message_id)
        result = connection.execute(get_message)
        message = result.fetchone()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        return message


@app.get("/channels")
async def get_channels() -> List[Channel]:
    with db.connect() as connection:
        get_all_channels = channel_table.select()
        channels = connection.execute(get_all_channels)

        return list(channels)


@app.post("/channels")
async def create_channel(channel: Channel, status_code=201) -> JSONResponse:
    with db.connect() as connection:
        insert_channel = channel_table.insert().values(name=channel.name)
        result = connection.execute(insert_channel)
        [created_id] = result.inserted_primary_key
        if not created_id:
            raise HTTPException(status_code=400, detail="Failed to create channel")

        return {"id": created_id}


@app.get("/channels/{channel_id}")
async def get_one_channel(channel_id: int) -> Channel:
    with db.connect() as connection:
        get_channel = select([channel_table]).where(channel_table.c.id == channel_id)
        result = connection.execute(get_channel)
        channel = result.fetchone()
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        return channel


@app.get("/users")
async def get_users() -> List[User]:
    with db.connect() as connection:
        get_all_users = user_table.select()
        users = connection.execute(get_all_users)

        return list(users)


@app.post("/users")
async def create_user(user: User, status_code=201) -> JSONResponse:
    with db.connect() as connection:
        insert_user = user_table.insert().values(username=user.username)
        result = connection.execute(insert_user)
        [created_id] = result.inserted_primary_key
        if not created_id:
            raise HTTPException(status_code=400, detail="Failed to create user")

        return {"id": created_id}


@app.get("/users/{username}")
async def get_one_user(username: str) -> User:
    with db.connect() as connection:
        get_user = select([user_table]).where(user_table.c.username == username)
        result = connection.execute(get_user)
        user = result.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            content = f"{client_id}: {data}"
            await manager.broadcast(content)
            message = await create_message(content)
            print(message)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"{client_id} left the chat :(")


async def create_message(content: str):
    with db.connect() as connection:
        insert_message = message_table.insert().values(
            content=content,
            user_id=1,
            channel_id=1,
        )
        result = connection.execute(insert_message)
        [created_id] = result.inserted_primary_key
        if not created_id:
            print("failed to save message :(")
            return None

        return {"id": created_id}