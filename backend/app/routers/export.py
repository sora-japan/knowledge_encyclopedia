from app.services.okf.exporter import to_markdown, sanitize, build_filename, build_index
from fastapi import Response, APIRouter, Depends, HTTPException
from app.db import get_db
from sqlalchemy.orm import Session
from app.models import Discovery
import uuid
from urllib.parse import quote
import io
import zipfile
from sqlalchemy import select

router = APIRouter(
    prefix = "/api/export/okf",
    tags = ["export"]
)

@router.get("/{discovery_id}")
def export_one(discovery_id: uuid.UUID, db: Session = Depends(get_db)):
    """発見1件を OKF 形式の Markdown で返す。"""
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    filename = sanitize(discovery.title) + ".md"
    return Response(
        content=to_markdown(discovery),
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"
        },
    )

@router.get("")
def export_all(db: Session = Depends(get_db)):
    """全件を OKF バンドル（zip）で返す。"""
    stmt = select(Discovery)
    discoveries = db.execute(stmt).scalars().all()

    seen = {}
    filenames = {}
    for d in discoveries:
        filenames[d.id] = build_filename(d.title, seen) + ".md"

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("index.md", build_index(discoveries, filenames))
        for d in discoveries:
            z.writestr(filenames[d.id], to_markdown(d))

    zip_name = "knowledge_encyclopedia.zip"
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(zip_name)}"
        },
    )
