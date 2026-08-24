import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscoveryNotFoundError, fetchDiscoveryById } from "@/lib/api";
import { DiscoveryResponse } from "@/lib/types";
import DiscoveryEditForm from "@/components/DiscoveryEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DiscoveryEditPage({ params }: Props) {
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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link
            href={`/discoveries/${id}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
          >
            <span aria-hidden="true">←</span>
            発見に戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-5 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
          発見を編集
        </h1>
        <DiscoveryEditForm discovery={discovery} />
      </main>
    </div>
  );
}
