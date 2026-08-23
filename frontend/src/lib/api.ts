import { DiscoveryResponse } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function fetchDiscoveries(): Promise<DiscoveryResponse[]> {
  if (!BASE_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません");
  }
  const response = await fetch(`${BASE_URL}/api/discoveries`, {
    cache: "no-store",
  });
  if (!response.ok){
    throw new Error(`一覧の取得に失敗しました: ${response.status}`);
  }
  return response.json();
}
