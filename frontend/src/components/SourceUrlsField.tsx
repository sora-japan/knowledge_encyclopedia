"use client";

import { useState } from "react";

/** 参考URLの上限。バックエンドの source_urls に合わせている */
export const MAX_SOURCE_URLS = 10;

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

/**
 * 参考URLの入力欄。タグと同じく「入力して追加 → ×で個別削除」で編集する。
 * 登録フォームと編集フォームの両方で使うので独立させている。
 */
export default function SourceUrlsField({ urls, onChange, disabled }: Props) {
  const [draft, setDraft] = useState("");

  const full = urls.length >= MAX_SOURCE_URLS;

  function addUrl() {
    const value = draft.trim();
    if (!value || full || urls.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...urls, value]);
    setDraft("");
  }

  function removeUrl(target: string) {
    onChange(urls.filter((url) => url !== target));
  }

  /** URL入力での Enter がフォーム送信にならないようにここで拾う */
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addUrl();
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="source_url_draft"
        className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
      >
        参考URL
        <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
          {urls.length} / {MAX_SOURCE_URLS}
        </span>
      </label>

      {urls.length > 0 && (
        // URLは長くなりやすいので、タグのように横に並べず1行ずつ積む
        <ul className="flex flex-col gap-1.5">
          {urls.map((url) => (
            <li
              key={url}
              className="flex items-start gap-1 rounded-md bg-zinc-100 py-1 pl-2 pr-1 text-xs text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300"
            >
              <span className="min-w-0 flex-1 break-all">{url}</span>
              <button
                type="button"
                onClick={() => removeUrl(url)}
                disabled={disabled}
                aria-label={`${url} を削除`}
                className="shrink-0 rounded px-1 text-zinc-400 transition hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-zinc-100"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          id="source_url_draft"
          name="source_url_draft"
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || full}
          placeholder={
            full ? `参考URLは${MAX_SOURCE_URLS}個までです` : "https://example.com"
          }
          className="w-full rounded-xl border border-black/[.08] bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={disabled || full || draft.trim() === ""}
          className="shrink-0 rounded-xl border border-black/[.08] px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[.06]"
        >
          追加
        </button>
      </div>
    </div>
  );
}
