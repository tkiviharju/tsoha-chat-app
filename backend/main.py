from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schemas import Message, Channel, User
from db.client import get_db_client
from db.tables import message_table, channel_table, user_table

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

manager = ConnectionManager()
app = FastAPI()
db = get_db_client()

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

@app.post("/messages")
async def create_message(message: Message) -> str:
    with db.connect() as connection:
        insert_message = message_table.insert().values(content=message.content, user_id=message.user_id, channel_id=message.channel_id)
        connection.execute(insert_message)

        return 'all good'


@app.get("/channels")
async def get_channels() -> List[Channel]:
    with db.connect() as connection:
        get_all_channels = channel_table.select()
        channels = connection.execute(get_all_channels)
        
        return list(channels)


@app.post("/channels")
async def create_channel(channel: Channel) -> str:
    with db.connect() as connection:
        insert_channel = channel_table.insert().values(name=channel.name)
        connection.execute(insert_channel)

        return 'all good'

# @app.get("/channel/{channel_id}/messages")
# async def get_channel_messages() -> List[Channel]:
#     with db.connect() as connection:
#         get_all_channels = channel_table.select()
#         channels = connection.execute(get_all_channels)
        
#         return list(channels)


@app.get("/users")
async def get_users() -> List[User]:
    with db.connect() as connection:
        get_all_users = user_table.select()
        users = connection.execute(get_all_users)
        
        return list(users)


@app.post("/users")
async def create_user(user: User) -> str:
    with db.connect() as connection:
        insert_user = user_table.insert().values(username=user.username)
        connection.execute(insert_user)

        return 'all good'

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"{client_id} left the chat :(")
