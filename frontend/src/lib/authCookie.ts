/**
 * 認証Cookieの名前と属性を1か所に集める。
 *
 * Supabase のセッションCookie(sb-*)も、FastAPI に渡す app_access_token も、
 * 同じ属性で発行する。属性がずれるとログイン直後だけ動く、といった
 * 追いにくい壊れ方をするため、定義はここだけに置く。
 */

/**
 * FastAPI が読むアクセストークンのCookie名。
 * Supabase 既定の sb-<ref>-auth-token は名前がプロジェクト依存で、
 * 値が長いと .0 / .1 に分割されるため、バックエンド側で読む名前としては使わない。
 */
export const APP_ACCESS_TOKEN_COOKIE = "app_access_token";

/**
 * ローカル開発は http なので、Secure を立てるとブラウザがCookieを保存しない。
 * 本番(https)でだけ立てる。
 */
const useSecureCookie = process.env.NODE_ENV === "production";

/**
 * 認証Cookieに共通で付ける属性。
 *
 * - httpOnly: JavaScript から document.cookie で読めなくする。
 *   XSS を踏んでもトークンを持ち出されない。localStorage を使わないのも同じ理由
 * - secure: https のときだけ送る。開発(http)では効かないので環境で切り替える
 * - sameSite "lax": 他サイトからの POST にはCookieを乗せない(CSRF対策)。
 *   OAuth の戻りは GET のトップレベル遷移なので lax でもCookieは乗る
 * - path "/": ページと /api プロキシの両方に送る必要があるのでルート
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: useSecureCookie,
  sameSite: "lax",
  path: "/",
} as const;
