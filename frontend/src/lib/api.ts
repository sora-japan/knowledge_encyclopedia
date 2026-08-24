import { DiscoveryResponse, DiscoveryCreate, DiscoveryUpdate } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * 存在しないIDを引いたときのエラー。
 * 通信エラーと区別して notFound() を出すために型で分けている。
 */
export class DiscoveryNotFoundError extends Error {}

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

export async function createDiscovery(
  payload: DiscoveryCreate
): Promise<DiscoveryResponse>{
  if (!BASE_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません");
  }

  const response = await fetch(`${BASE_URL}/api/discoveries`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (response.status === 429){
    throw new Error("本日の登録上限に達しました");
  }

  if (!response.ok){
    throw new Error (`登録に失敗しました: ${response.status}`);
  }

  return response.json();
}

export async function fetchDiscoveryById(id: string): Promise<DiscoveryResponse>{
  if (!BASE_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません");
  }

  const response = await fetch(`${BASE_URL}/api/discoveries/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404){
    throw new DiscoveryNotFoundError("この発見は見つかりませんでした");
  }

  if (!response.ok){
    throw new Error (`取得に失敗しました: ${response.status}`);
  }

  return response.json();
}

export async function updateDiscovery(
  id: string,
  payload: DiscoveryUpdate
): Promise<DiscoveryResponse>{
  if (!BASE_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません");
  }

  const response = await fetch(`${BASE_URL}/api/discoveries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 404){
    throw new DiscoveryNotFoundError("この発見は見つかりませんでした");
  }

  if (!response.ok){
    throw new Error(`更新に失敗しました: ${response.status}`);
  }

  return response.json();
}
