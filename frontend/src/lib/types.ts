export type Category = "プログラミング" | "データ・AI" | "インフラ・ツール" | "ビジネス" | "健康・生活" | "言語・人文" | "科学" | "その他"

export interface DiscoveryResponse{
  id: string; 
  raw_text: string;
  title: string;
  category: Category; 
  summary: string;
  tags: string[];
  discovered_at: string; 
  created_at: string;
  updated_at: string; 
}

export interface DiscoveryCreate {
  raw_text: string;
  discovered_at?: string;
}

/**
 * 編集の送信内容。バックエンドの DiscoveryUpdate と対応し、
 * raw_text は編集できないので含めない（全項目を必ず送る PUT）。
 */
export interface DiscoveryUpdate {
  title: string;
  category: Category;
  summary: string;
  tags: string[];
  discovered_at: string;
}

export interface AskRequest {
  question: string;
}

export interface AiResponse {
  answer: string;
  sources: DiscoveryResponse[];
}
