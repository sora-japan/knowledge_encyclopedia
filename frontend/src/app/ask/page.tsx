import Link from "next/link";
import type { Metadata } from "next";
import AskForm from "@/components/AskForm";

export const metadata: Metadata = {
  title: "図鑑に質問 | 知識図鑑",
};

export default function AskPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            図鑑に質問
          </h1>
          <Link
            href="/"
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            図鑑に戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <p className="mb-5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          これまでに登録した発見をもとに AI が答えます。根拠になった発見カードも一緒に表示されます。
        </p>
        <AskForm />
      </main>
    </div>
  );
}
