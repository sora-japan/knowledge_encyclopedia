import Link from "next/link";
import { fetchDiscoveries } from "@/lib/api";
import DiscoveryGrid from "@/components/DiscoveryGrid";

export default async function Home() {
  const discoveries = await fetchDiscoveries();

  // 未設定のまま href="undefined/..." を出すと壊れたリンクになるので、その場合は出さない
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            知識図鑑
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/ask"
              className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              図鑑に質問
            </Link>
            <Link
              href="/new"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
            >
              発見を登録
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <DiscoveryGrid discoveries={discoveries} />

        {/* 全件書き出しは主要操作ではないので、一覧を見終えた末尾に控えめに置く */}
        {apiBaseUrl && (
          <div className="mt-8 flex flex-col items-end gap-0.5">
            {/* Content-Disposition が付くので、リンクを開くだけで zip が落ちてくる */}
            <a
              href={`${apiBaseUrl}/api/export/okf`}
              className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              すべてMarkdownで書き出す
            </a>
            <p className="px-2 text-xs text-zinc-400 dark:text-zinc-500">
              zip でまとめて落ちてきます。Obsidian などで開けます。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
