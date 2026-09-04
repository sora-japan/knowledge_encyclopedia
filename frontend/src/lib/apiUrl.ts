/**
 * API の呼び出し先を組み立てるヘルパ。
 *
 * ブラウザが投げるリクエストは同一オリジンの /api に出し、
 * next.config.ts の rewrites で FastAPI に転送する。
 * Next.js のサーバー側から投げるリクエストは自分自身のプロキシを
 * 経由しても意味がないので、FastAPI を直接叩く。
 *
 * 経路を取り違えないよう、URLの組み立てはこの2つの関数だけに閉じる。
 */

/**
 * ブラウザが投げるリクエスト用のパス。
 * Client Component の fetch と、<a href> のダウンロードリンクで使う。
 * 相対パスなので必ず同一オリジンに出て、プロキシを通る。
 */
export function browserApiPath(path: string): string {
  return `/api${path}`;
}

/**
 * Next.js のサーバー側から投げるリクエスト用の絶対URL。
 * Server Component の fetch で使う。プロキシは経由しない。
 */
export function serverApiUrl(path: string): string {
  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  if (!baseUrl) {
    // INTERNAL_API_BASE_URL はブラウザに渡らないので、
    // Client Component から誤って呼んだ場合もここで止まる
    throw new Error(
      "INTERNAL_API_BASE_URL が設定されていません（serverApiUrl はサーバー側専用です）"
    );
  }
  // 末尾の / があっても // にならないように落とす
  return `${baseUrl.replace(/\/+$/, "")}/api${path}`;
}
