"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDiscovery } from "@/lib/api";

/** ローカルタイムでの今日を YYYY-MM-DD で返す（date 入力の初期値用） */
function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function DiscoveryForm() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [discoveredAt, setDiscoveredAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 初期値の「今日」はサーバーとブラウザでタイムゾーンがずれて
   * ハイドレーションエラーになるため、マウント後に入れる。
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 今日の日付はクライアントでしか決められないため、マウント後に一度だけ入れる
    setDiscoveredAt(today());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await createDiscovery({
        raw_text: rawText,
        discovered_at: discoveredAt || undefined,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      // createDiscovery が投げる Error の message をそのまま見せる
      setError(err instanceof Error ? err.message : "登録に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04]"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="raw_text"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          発見したこと
        </label>
        <textarea
          id="raw_text"
          name="raw_text"
          required
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={submitting}
          placeholder="今日知ったことを、思いついたままの言葉で書いてください。タイトルやカテゴリは AI が整理します。"
          className="w-full resize-y rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="discovered_at"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          発見した日
        </label>
        <input
          id="discovered_at"
          name="discovered_at"
          type="date"
          value={discoveredAt}
          onChange={(e) => setDiscoveredAt(e.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 sm:w-52 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
        >
          {submitting ? "AIが整理中..." : "登録する"}
        </button>
        {submitting && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            数秒かかります。そのままお待ちください。
          </span>
        )}
      </div>
    </form>
  );
}
