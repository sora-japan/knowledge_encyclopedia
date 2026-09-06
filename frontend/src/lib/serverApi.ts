import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DiscoveryResponse } from "@/lib/types";
import { serverApiUrl } from "@/lib/apiUrl";
import { APP_ACCESS_TOKEN_COOKIE } from "@/lib/authCookie";
import { DiscoveryNotFoundError } from "@/lib/api";

/**
 * Server Component から呼ぶAPIだけを集めたファイル。
 *
 * api.ts と分けているのは next/headers のため。あれは Server Component 専用で、
 * Client Component からも読まれる api.ts に置くとビルドが通らない。
 * URLの組み立てとエラーの型は api.ts / apiUrl.ts と共有している。
 */

/**
 * FastAPI に転送する認証ヘッダ。
 *
 * serverApiUrl は FastAPI を直接叩く = ブラウザを経由しないので、
 * Cookie が自動では乗らない。app_access_token だけを明示的に付ける。
 * (Client Component 側は同一オリジンの /api に出るのでブラウザが自動で付ける)
 */
async function authHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get(APP_ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return {};
  }
  return { Cookie: `${APP_ACCESS_TOKEN_COOKIE}=${token}` };
}

/** Server Component 用 */
export async function fetchDiscoveries(): Promise<DiscoveryResponse[]> {
  const response = await fetch(serverApiUrl("/discoveries"), {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (response.status === 401){
    redirect("/login");
  }
  if (!response.ok){
    throw new Error(`一覧の取得に失敗しました: ${response.status}`);
  }
  return response.json();
}

/** Server Component 用 */
export async function fetchDiscoveryById(id: string): Promise<DiscoveryResponse>{
  const response = await fetch(serverApiUrl(`/discoveries/${id}`), {
    cache: "no-store",
    headers: await authHeaders(),
  });

  if (response.status === 401){
    redirect("/login");
  }

  if (response.status === 404){
    throw new DiscoveryNotFoundError("この発見は見つかりませんでした");
  }

  if (!response.ok){
    throw new Error (`取得に失敗しました: ${response.status}`);
  }

  return response.json();
}
