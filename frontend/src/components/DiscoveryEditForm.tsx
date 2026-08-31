"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDiscovery } from "@/lib/api";
import { Category, DiscoveryResponse } from "@/lib/types";
import { CATEGORIES } from "@/lib/categoryStyle";
import SourceUrlsField from "@/components/SourceUrlsField";

/** タグの上限。バックエンドの DiscoveryUpdate に合わせている */
const MAX_TAGS = 5;

/**
 * discovered_at は API から 2025-05-18 で返ってくるが、
 * 日時付きで来ても date 入力に入れられるよう先頭だけ取り出す。
 */
function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}

type Props = {
  discovery: DiscoveryResponse;
};

export default function DiscoveryEditForm({ discovery }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(discovery.title);
  const [category, setCategory] = useState<Category>(discovery.category);
  const [summary, setSummary] = useState(discovery.summary);
  const [tags, setTags] = useState<string[]>(discovery.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [discoveredAt, setDiscoveredAt] = useState(
    toDateInputValue(discovery.discovered_at)
  );
  const [sourceUrls, setSourceUrls] = useState<string[]>(discovery.source_urls);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsFull = tags.length >= MAX_TAGS;

  function addTag() {
    const value = tagDraft.trim();
    if (!value || tagsFull || tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setTags([...tags, value]);
    setTagDraft("");
  }

  function removeTag(target: string) {
    setTags(tags.filter((tag) => tag !== target));
  }

  /** タグ入力での Enter がフォーム送信にならないようにここで拾う */
  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addTag();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateDiscovery(discovery.id, {
        title,
        category,
        summary,
        tags,
        discovered_at: discoveredAt,
        source_urls: sourceUrls,
      });
      router.push(`/discoveries/${discovery.id}`);
      router.refresh();
    } catch (err) {
      // updateDiscovery が投げる Error の message をそのまま見せる
      setError(err instanceof Error ? err.message : "更新に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[.04]"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={30}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="category"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          カテゴリ
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          disabled={submitting}
          className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 sm:w-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50"
        >
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="summary"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          要約
        </label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={4}
          maxLength={120}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={submitting}
          className="w-full resize-y rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="tag_draft"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          タグ
          <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {tags.length} / {MAX_TAGS}
          </span>
        </label>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-100 py-0.5 pl-2 pr-1 text-xs text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={submitting}
                  aria-label={`${tag} を削除`}
                  className="rounded px-1 text-zinc-400 transition hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-zinc-100"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            id="tag_draft"
            name="tag_draft"
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={submitting || tagsFull}
            placeholder={
              tagsFull ? `タグは${MAX_TAGS}個までです` : "タグを入力して追加"
            }
            className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 sm:w-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={submitting || tagsFull || tagDraft.trim() === ""}
            className="shrink-0 rounded-xl border border-black/[.08] px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[.06]"
          >
            追加
          </button>
        </div>
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
          required
          value={discoveredAt}
          onChange={(e) => setDiscoveredAt(e.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 sm:w-52 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50"
        />
      </div>

      <SourceUrlsField
        urls={sourceUrls}
        onChange={setSourceUrls}
        disabled={submitting}
      />

      {/* raw_text は編集できないので、詳細ページと同じ見た目で表示だけする */}
      <section className="mt-1 border-t border-black/[.06] pt-5 dark:border-white/10">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500">
          元の入力
        </h2>
        <p className="whitespace-pre-wrap rounded-xl border border-dashed border-black/[.12] bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-500 dark:border-white/15 dark:bg-black/20 dark:text-zinc-400">
          {discovery.raw_text}
        </p>
      </section>

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
          {submitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
