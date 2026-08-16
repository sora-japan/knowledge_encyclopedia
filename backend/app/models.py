from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Text, String, DateTime, Uuid, Date, func, ARRAY, Index
from typing_extensions import Annotated
from datetime import datetime, date
import uuid
from app.db import Base


# 型の作成 Annotated
# 本来はテーブル数の多い時に使用すると便利
uuid_pk = Annotated[uuid.UUID, mapped_column(
    Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
)]
str_100 = Annotated[str, mapped_column(String(100))]
str_50 = Annotated[str, mapped_column(String(50))]
timestamp = Annotated[
    datetime,
    mapped_column(DateTime(timezone=True), server_default=func.now()),
]
date_only = Annotated[date, mapped_column(Date)]

# discoveriesテーブル
class Discovery(Base):
    __tablename__ = "discoveries" # テーブル名
    id: Mapped[uuid_pk] = mapped_column(comment="発見ID")
    raw_text: Mapped[str] = mapped_column(Text)
    title: Mapped[str_100] = mapped_column()
    category: Mapped[str_50] = mapped_column()
    summary: Mapped[str] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(ARRAY(Text))
    discovered_at: Mapped[date_only] = mapped_column()
    created_at: Mapped[timestamp] = mapped_column(comment="作成日時")
    __table_args__ = (
        Index("ix_discoveries_discovered_at", "discovered_at", "created_at"),
    )

