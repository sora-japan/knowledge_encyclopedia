import { NextResponse, type NextRequest } from "next/server";
import { APP_ACCESS_TOKEN_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/authCookie";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * 未ログインなら /login に飛ばす。ついでにトークンの更新もここで行う。
 *
 * Next.js 16 で middleware.ts は proxy.ts に改名された(機能は同じ)。
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md 参照。
 *
 * アクセストークンは1時間ほどで切れるので、リクエストのたびに
 * Supabase クライアントを通してセッションを取り直す。期限が近ければ
 * ここでリフレッシュが走り、新しいトークンがCookieに書き戻される。
 */
export async function proxy(request: NextRequest) {
  // Supabase が書きたがるCookieを貯めておき、最後にまとめてレスポンスに載せる。
  // setAll の途中でレスポンスを作り直すと、前回分の Set-Cookie が消えるため
  const pendingCookies: {
    name: string;
    value: string;
    options: Record<string, unknown>;
  }[] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      for (const cookie of cookiesToSet) {
        // この先の Server Component は cookies() でリクエスト側を読む。
        // リフレッシュ直後に古いトークンを使わせないよう、request にも反映する
        request.cookies.set(cookie.name, cookie.value);
        pendingCookies.push(cookie);
      }
      Object.assign(pendingHeaders, headers);
    },
  });

  // 期限切れならこの中でリフレッシュされ、上の setAll が呼ばれる
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    applyPending(redirectResponse, pendingCookies, pendingHeaders);
    // セッションが無いのに残っているトークンは消す
    redirectResponse.cookies.set(APP_ACCESS_TOKEN_COOKIE, "", {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0,
    });
    return redirectResponse;
  }

  // FastAPI が読むCookieを、いま有効なトークンに合わせ直す
  request.cookies.set(APP_ACCESS_TOKEN_COOKIE, session.access_token);

  const response = NextResponse.next({ request });
  applyPending(response, pendingCookies, pendingHeaders);
  response.cookies.set(APP_ACCESS_TOKEN_COOKIE, session.access_token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: session.expires_in,
  });
  return response;
}

function applyPending(
  response: NextResponse,
  cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[],
  headers: Record<string, string>
) {
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

export const config = {
  /**
   * 除外するもの:
   * - api      … FastAPI へのプロキシ。未認証なら FastAPI が 401 を返すべきで、
   *               ここでログイン画面のHTMLに差し替えると fetch 側が壊れる
   * - login, auth/callback … ログインしていない状態で通る必要がある経路
   * - _next/*, 各種静的ファイル … 認証をかける対象ではない
   */
  matcher: [
    "/((?!api|login|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
