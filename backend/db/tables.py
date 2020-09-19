from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey
from db.client import get_db_client

db = get_db_client()
metadata = MetaData(db)


message_table = Table(
    "message",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("channel_id", Integer, ForeignKey("channel.id")),
    Column("user_id", Integer, ForeignKey("user_account.id")),
    Column("content", String),
)

channel_table = Table(
    "channel",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String),
)

user_table = Table(
    "user_account",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String),
)
