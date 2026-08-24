"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDiscovery } from "@/lib/api";

type Props = {
  id: string;
  title: string;
};

export default function DeleteButton({ id, title }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (deleting) return;

    // 削除した発見は復元できないので、消す前に必ず確認を挟む
    const confirmed = window.confirm(
      `「${title}」を削除します。\n元に戻すことはできません。よろしいですか？`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteDiscovery(id);
      router.push("/");
      router.refresh();
    } catch (err) {
      // deleteDiscovery が投げる Error の message をそのまま見せる
      setError(err instanceof Error ? err.message : "削除に失敗しました");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={deleting}
        className="inline-flex items-center rounded-lg px-2 py-1 text-sm text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
      >
        {deleting ? "削除中..." : "この発見を削除"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}
