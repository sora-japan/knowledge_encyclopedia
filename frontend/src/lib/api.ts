import { DiscoveryResponse, DiscoveryCreate, DiscoveryUpdate, AskRequest, AiResponse } from "@/lib/types";
import { browserApiPath } from "@/lib/apiUrl";

/**
 * Client Component から呼ぶAPIの集約先。
 * browserApiPath 経由なので、同一オリジンの /api プロキシを通る。
 * Cookie はブラウザが自動で付けるので、ここでは何もしない。
 *
 * Server Component から呼ぶものは serverApi.ts にある（next/headers を
 * 使うため、Client Component からも読まれるこのファイルには置けない）。
 */

/**
 * 存在しないIDを引いたときのエラー。
 * 通信エラーと区別して notFound() を出すために型で分けている。
 */
export class DiscoveryNotFoundError extends Error {}

/**
 * Client Component 用の 401 の扱い。
 *
 * router.push ではなくページ全体を読み直す。セッションが切れている以上、
 * proxy.ts を通り直して Cookie を作り直させる必要があり、
 * クライアント側のルーター遷移では proxy が走らないため。
 */
function redirectToLoginFromBrowser(): never {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- proxy.ts を通す必要があるので、あえてフルリロードする
  window.location.assign("/login");
  throw new Error("ログインが必要です");
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

  if (response.status === 401){
    redirectToLoginFromBrowser();
  }

  if (response.status === 429){
    throw new Error("本日の登録上限に達しました");
  }

  if (!response.ok){
    throw new Error (`登録に失敗しました: ${response.status}`);
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

  if (response.status === 401){
    redirectToLoginFromBrowser();
  }

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

  if (response.status === 401){
    redirectToLoginFromBrowser();
  }

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

  if (response.status === 401) {
    redirectToLoginFromBrowser();
  }

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
