from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

# Modelの基底クラスの定義
class Base(DeclarativeBase):
    pass

engine = create_engine(
    settings.DATABASE_URL,
    echo=False
)
# Base.metadata.create_all(engine) tableを作る際に必要
# 今回はAlembic initを使用するため、使わない

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
