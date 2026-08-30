from enum import StrEnum

class Category(StrEnum):
    PROGRAMMING = "プログラミング"
    DATA_AI = "データ・AI"
    INFRA_TOOL = "インフラ・ツール"
    BUSINESS = "ビジネス"
    HEALTH_LIFE = "健康・生活"
    LANGUAGE_HUMANITIES = "言語・人文"
    SCIENCE = "科学"
    OTHER = "その他"

class LlmCallKind(StrEnum):
    EXTRACT = "extract"
    EMBED = "embed"
    ASK = "ask"
