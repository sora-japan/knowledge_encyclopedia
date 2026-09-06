"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ACCESS_TOKEN_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/authCookie";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * ログイン/ログアウトの入口。
 * どちらも Server Action にしてある。ブラウザ側に Supabase クライアントを
 * 置かないので、トークンに触れるコードがサーバーの外に出ない。
 */

/** next/headers の cookies() に Supabase の読み書きをつなぐ */
async function cookieMethods() {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll(),
    setAll: (
      cookiesToSet: { name: string; value: string; options: object }[]
    ) => {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options);
      }
    },
  };
}

/**
 * 自分自身のオリジン。OAuth の戻り先URLを組み立てるのに使う。
 * 環境変数で持つとローカルと本番でずれるので、リクエストから取る。
 */
async function currentOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    throw new Error("リクエストから host を取得できませんでした");
  }
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${protocol}://${host}`;
}

/** Google の認証画面へ送り出す。PKCE の code_verifier はここでCookieに入る */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createSupabaseServerClient(await cookieMethods());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await currentOrigin()}/auth/callback`,
      // サーバー上に window は無いが、意図を明示しておく
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=signin");
  }

  // redirect() は例外を投げて抜けるので、try/catch で囲まない
  redirect(data.url);
}

/** Supabase のセッションを破棄し、FastAPI 用のCookieも消す */
export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient(await cookieMethods());

  // sb-* のセッションCookieは signOut() が消す(setAll 経由)
  await supabase.auth.signOut();

  // app_access_token は自分で入れたものなので自分で消す。
  // 属性が違うと別Cookie扱いで消えないため、発行時と同じ属性を渡す
  const cookieStore = await cookies();
  cookieStore.set(APP_ACCESS_TOKEN_COOKIE, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  redirect("/login");
}
