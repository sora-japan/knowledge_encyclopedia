import { DiscoveryResponse, DiscoveryCreate, DiscoveryUpdate, AskRequest, AiResponse } from "@/lib/types";
import { browserApiPath, serverApiUrl } from "@/lib/apiUrl";

/**
 * API呼び出しの集約先。呼び出し元によってURLの作り方が2通りある。
 *
 * - Server Component から呼ぶもの → serverApiUrl（FastAPI を直接叩く）
 * - Client Component から呼ぶもの → browserApiPath（/api のプロキシを通る）
 *
 * 各関数のコメントでどちら側から呼ぶものかを明示している。
 */

/**
 * 存在しないIDを引いたときのエラー。
 * 通信エラーと区別して notFound() を出すために型で分けている。
 */
export class DiscoveryNotFoundError extends Error {}

/** Server Component 用 */
export async function fetchDiscoveries(): Promise<DiscoveryResponse[]> {
  const response = await fetch(serverApiUrl("/discoveries"), {
    cache: "no-store",
  });
  if (!response.ok){
    throw new Error(`一覧の取得に失敗しました: ${response.status}`);
  }
  return response.json();
}

/** Client Component 用 */
export async function createDiscovery(
  payload: DiscoveryCreate
): Promise<DiscoveryResponse>{
  const response = await fetch(browserApiPath("/discoveries"), {
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

/** Server Component 用 */
export async function fetchDiscoveryById(id: string): Promise<DiscoveryResponse>{
  const response = await fetch(serverApiUrl(`/discoveries/${id}`), {
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

/** Client Component 用 */
export async function updateDiscovery(
  id: string,
  payload: DiscoveryUpdate
): Promise<DiscoveryResponse>{
  const response = await fetch(browserApiPath(`/discoveries/${id}`), {
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

/** Client Component 用 */
export async function deleteDiscovery(id: string): Promise<void>{
  const response = await fetch(browserApiPath(`/discoveries/${id}`), {
    method: "DELETE",
  });

  if (response.status === 404){
    throw new DiscoveryNotFoundError("この発見は見つかりませんでした");
  }

  if (!response.ok){
    throw new Error(`削除に失敗しました: ${response.status}`);
  }
}

/** Client Component 用 */
export async function askQuestion(
  payload: AskRequest
): Promise<AiResponse> {
  const response = await fetch(browserApiPath("/ask"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) {
    throw new Error("本日の質問回数の上限に達しました");
  }

  if (response.status === 502) {
    throw new Error("回答の生成に失敗しました。しばらく待って再度お試しください");
  }

  if (!response.ok) {
    throw new Error(`回答の取得に失敗しました: ${response.status}`);
  }

  return response.json();

}
