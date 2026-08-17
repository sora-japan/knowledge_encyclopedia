from sqlalchemy import create_engine
from dotenv import load_dotenv
import os    
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Modelの基底クラスの定義
if DATABASE_URL is None:
    raise RuntimeError("DATABASE_URL が設定されていません")
class Base(DeclarativeBase):
    pass

engine = create_engine(
    DATABASE_URL,
    echo=True
)
# Base.metadata.create_all(engine) tableを作る際に必要
# 今回はAlembic initを使用するため、使わない

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def session_factory():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
