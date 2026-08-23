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
}

export interface DiscoveryCreate {
  raw_text: string;
  discovered_at?: string;
}
