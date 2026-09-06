import { NextResponse, type NextRequest } from "next/server";
import { APP_ACCESS_TOKEN_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/authCookie";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Google から戻ってくる先。
 *
 * PKCE なので URL に載ってくるのは使い捨ての code だけで、
 * アクセストークンは載らない。code とCookieに入っている code_verifier を
 * 突き合わせてセッションに交換するのは、このサーバー側の処理。
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // ユーザーが同意をキャンセルした場合など
  if (requestUrl.searchParams.get("error") || !code) {
    return NextResponse.redirect(new URL("/login?error=callback", requestUrl));
  }

  // 先にレスポンスを作り、Supabase が書くCookieをここに載せる
  const response = NextResponse.redirect(new URL("/", requestUrl));

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
      // 認証Cookieを含むレスポンスをCDNにキャッシュさせないためのヘッダ
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/login?error=callback", requestUrl));
  }

  // FastAPI が読む名前に詰め替える。
  // 有効期限をアクセストークン自体の寿命に合わせておくと、
  // 期限切れのトークンを送り続けることがない
  response.cookies.set(APP_ACCESS_TOKEN_COOKIE, data.session.access_token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: data.session.expires_in,
  });

  return response;
}
