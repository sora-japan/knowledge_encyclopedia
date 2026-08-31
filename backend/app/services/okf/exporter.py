from collections import Counter
import re

def sanitize(name: str) -> str:
    name = re.sub(r'[/\\:*?"<>|]', '-', name) # 禁止文字:ファイル名に使えないもの
    name = re.sub(r'[\x00-\x1f]', '', name) # 制御文字
    name = name.strip(' .') # 末尾の空白とドット（Windows）
    return name or "untitle"


def to_markdown(discovery: Discovery) -> str:
    mark = f"""
        type: Discovery
        title: {discovery.title}
        description: {discovery.summary}
        tags: {discovery.tags}
        sources:
            resource: {discovery.source_urls}
        category: {discovery.category}
        generated:
            by: knowledge_encyclopedia/gemini-3.1-flash-lite
            at: {discovery.created_at}
        verified:
            by: human:
            at: {discovery.updated_at} # 考える余地あり
        {discovery.raw_text}
        """
    return mark

def build_filename(title: str):
    """
    衝突時に連番をつける
    """
    count = Counter(title.discovery)
    if count == 0:
        return title.discovery
    else:
        new_file_name = title.discovery + str(count)
        return new_file_name


def build_index(discoveries: ) -> str:
    """
    index.md の生成
    """
