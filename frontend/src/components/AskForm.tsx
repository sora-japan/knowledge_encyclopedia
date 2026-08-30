"use client";

import { useState } from "react";
import { askQuestion } from "@/lib/api";
import { AiResponse } from "@/lib/types";
import DiscoveryCard from "@/components/DiscoveryCard";

/** 質問文の最大文字数。バックエンドに投げる前にここで止める */
const MAX_LENGTH = 500;

export default function AskForm() {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (asking) return;

    setAsking(true);
    setError(null);
    // 前回の回答は残さない。新しい質問の根拠と混ざって見えるのを防ぐ
    setResult(null);

    try {
      const response = await askQuestion({ question });
      setResult(response);
    } catch (err) {
      // askQuestion が投げる Error の message をそのまま見せる
      setError(err instanceof Error ? err.message : "回答の取得に失敗しました");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04]"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="question"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            質問
          </label>
          <textarea
            id="question"
            name="question"
            required
            rows={4}
            maxLength={MAX_LENGTH}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
            placeholder="図鑑に溜めた発見に聞いてみましょう。例：これまでに学んだ非同期処理の要点は？"
            className="w-full resize-y rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <p className="text-right text-xs text-zinc-400 dark:text-zinc-500">
            {question.length} / {MAX_LENGTH}
          </p>
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
            disabled={asking}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          >
            {asking ? "考え中..." : "質問する"}
          </button>
          {asking && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              10秒ほどかかります。そのままお待ちください。
            </span>
          )}
        </div>
      </form>

      {result && (
        <section className="flex flex-col gap-8">
          <div className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04]">
            <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              回答
            </h2>
            {/* 改行をそのまま残したいので whitespace-pre-wrap */}
            <p className="whitespace-pre-wrap text-[15px] leading-8 text-zinc-900 dark:text-zinc-50">
              {result.answer}
            </p>
          </div>

          {/* 根拠が無いときはカード領域ごと出さない */}
          {result.sources.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                この回答の根拠
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {result.sources.map((discovery) => (
                  <DiscoveryCard key={discovery.id} discovery={discovery} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
