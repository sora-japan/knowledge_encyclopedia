import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscoveryNotFoundError, fetchDiscoveryById } from "@/lib/api";
import { DiscoveryResponse } from "@/lib/types";
import { categoryStyle } from "@/lib/categoryStyle";
import { browserApiPath } from "@/lib/apiUrl";
import DeleteButton from "@/components/DeleteButton";

/**
 * ISO 形式の日付文字列を 2025/05/18 の形に整える。
 * new Date() を使うとサーバーとブラウザでタイムゾーンがずれて
 * ハイドレーションエラーになるため、文字列のまま切り出す。
 */
function formatDate(value: string): string {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!matched) return value;
  const [, year, month, day] = matched;
  return `${year}/${month}/${day}`;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DiscoveryDetailPage({ params }: Props) {
  const { id } = await params;

  let discovery: DiscoveryResponse;
  try {
    discovery = await fetchDiscoveryById(id);
  } catch (error) {
    // 404 だけ notFound()、通信エラーなどはそのままエラー画面に出す
    if (error instanceof DiscoveryNotFoundError) {
      notFound();
    }
    throw error;
  }

  const style = categoryStyle(discovery.category);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
          >
            <span aria-hidden="true">←</span>
            図鑑に戻る
          </Link>
          <div className="flex items-center gap-1">
            {/* Content-Disposition が付くので、リンクを開くだけで .md が落ちてくる */}
            <a
              href={browserApiPath(`/export/okf/${id}`)}
              className="inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
            >
              Markdownでダウンロード
            </a>
            <Link
              href={`/discoveries/${id}/edit`}
              className="inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
            >
              編集
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <article className="flex flex-col gap-5 rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[.04]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${style.badge}`}
            >
              {discovery.category}
            </span>
            <time
              dateTime={discovery.discovered_at}
              className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
            >
              {formatDate(discovery.discovered_at)}
            </time>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {discovery.title}
          </h1>

          <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {discovery.summary}
          </p>

          {discovery.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {discovery.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-md px-2 py-0.5 text-xs ${style.tag}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {discovery.source_urls.length > 0 && (
            <section className="mt-1 border-t border-black/[.06] pt-5 dark:border-white/10">
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
                参考URL
              </h2>
              <ul className="flex flex-col gap-1.5">
                {discovery.source_urls.map((url) => (
                  <li key={url}>
                    {/* 外部サイトへ出るので新しいタブ + rel で参照元を渡さない */}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-blue-600 underline underline-offset-2 transition hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 元の入力は AI が整形した本文と混ざらないよう、囲みと等幅で区別する */}
          <section className="mt-1 border-t border-black/[.06] pt-5 dark:border-white/10">
            <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
              元の入力
            </h2>
            <p className="whitespace-pre-wrap rounded-xl border border-dashed border-black/[.12] bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-500 dark:border-white/15 dark:bg-black/20 dark:text-zinc-400">
              {discovery.raw_text}
            </p>
          </section>
        </article>

        {/* 削除はヘッダーの「編集」と間違えて押さないよう、本文を読み終えた末尾に置く */}
        <div className="mt-6 flex justify-end">
          <DeleteButton id={id} title={discovery.title} />
        </div>
      </main>
    </div>
  );
}
