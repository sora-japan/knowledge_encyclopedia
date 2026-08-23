import { DiscoveryResponse } from "@/lib/types";
import { categoryStyle } from "@/lib/categoryStyle";

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
  discovery: DiscoveryResponse;
};

export default function DiscoveryCard({ discovery }: Props) {
  const style = categoryStyle(discovery.category);

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-black/[.06] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[.04]">
      <div>
        <span
          className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${style.badge}`}
        >
          {discovery.category}
        </span>
      </div>

      <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {discovery.title}
      </h2>

      {/* raw_text は詳細画面で出すので一覧では summary のみ、3行で省略 */}
      <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {discovery.summary}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
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
        <time
          dateTime={discovery.discovered_at}
          className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
        >
          {formatDate(discovery.discovered_at)}
        </time>
      </div>
    </article>
  );
}
