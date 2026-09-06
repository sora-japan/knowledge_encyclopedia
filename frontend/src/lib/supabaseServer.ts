import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AUTH_COOKIE_OPTIONS } from "@/lib/authCookie";

/**
 * Supabase クライアントの生成をここに閉じる。
 *
 * ブラウザ用の createBrowserClient は使わない。あれはセッションを
 * document.cookie か localStorage に置くので、アクセストークンが
 * JavaScript から読めてしまう。認証はすべてサーバー側で完結させる。
 *
 * createServerClient は flowType: "pkce" が既定なので、
 * URLフラグメントにトークンが載る implicit flow にはならない。
 */

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} が設定されていません`);
  }
  return value;
}

/**
 * Cookie の読み書き方法を呼び出し側から渡す。
 * Server Action は next/headers の cookies()、Route Handler と proxy は
 * リクエスト/レスポンスを直接触る、と経路ごとに違うため。
 */
export function createSupabaseServerClient(
  cookies: CookieMethodsServer
): SupabaseClient {
  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      // 既定は httpOnly: false なので、明示的に上書きしないと
      // sb-* のセッションCookie(アクセストークンとリフレッシュトークンを含む)が
      // JavaScript から読めてしまう
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies,
    }
  );
}
