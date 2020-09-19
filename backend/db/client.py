from sqlalchemy import create_engine


def get_db_client():
    db_url = "postgresql://localhost:5432"

    return create_engine(db_url)