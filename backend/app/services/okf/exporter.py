import re
from app.models import Discovery
import yaml
from datetime import datetime
from zoneinfo import ZoneInfo

def sanitize(name: str) -> str:
    name = re.sub(r'[/\\:*?"<>|]', '-', name) # 禁止文字:ファイル名に使えないもの
    name = re.sub(r'[\x00-\x1f]', '', name) # 制御文字
    name = name.strip(' .') # 両端の空白とドット（Windows）
    return name or "untitle"

def to_iso(dt: datetime) -> str:
    return dt.astimezone(ZoneInfo("Asia/Tokyo")).isoformat(timespec="seconds")

def to_markdown(discovery: Discovery) -> str:
    data = {
        "type": "Discovery",
        "title": discovery.title,
        "description": discovery.summary,
        "tags": discovery.tags,
        "discovered_at": discovery.discovered_at,
        "category": discovery.category,
        "generated": {
            "by": "knowledge_encyclopedia/gemini-3.1-flash-lite",
            "at": to_iso(discovery.created_at)
        },
    } 
    if discovery.source_urls:
        data["sources"] = [{"resource": u} for u in discovery.source_urls]
    if discovery.updated_at != discovery.created_at:
        data["verified"] = {
            "by": "human:owner",
            "at": to_iso(discovery.updated_at)
            }
    yaml_data = yaml.safe_dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False)
    body = f"""{discovery.summary}

# 元の入力

{discovery.raw_text}

# 発見日

{discovery.discovered_at}
"""
    return f"---\n{yaml_data}---\n\n{body}\n"

def build_filename(title: str, seen: dict) -> str:
    """
    衝突時に連番をつける
    """
    new_title = sanitize(title)
    if new_title in seen:
        seen[new_title] += 1
        return f"{new_title}-{seen[new_title]}"
    else:
        seen[new_title] = 1
        return new_title

def build_index(discoveries: list[Discovery], filenames: dict) -> str:
    """
    index.md の生成
    """
    groups = {}
    for d in discoveries:
        groups.setdefault(d.category, []).append(d)
    index_md = ""
    for category, discovery_list in groups.items():
        index_md += f"# {category}\n\n"
        for d in discovery_list:
            index_md += f"* [{d.title}]({filenames[d.id]}) - {d.summary}\n"
        index_md += "\n"
    return index_md

if __name__ == "__main__":
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        seen = {}
        filenames = {}
        discoveries = db.query(Discovery).all()
        for d in discoveries:
            filenames[d.id] = build_filename(d.title, seen) + ".md"
        print(build_index(discoveries, filenames))
    finally:
        db.close()
