import { fetchDiscoveries } from "@/lib/api";
import DiscoveryGrid from "@/components/DiscoveryGrid";

export default async function Home() {
  const discoveries = await fetchDiscoveries();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            知識図鑑
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <DiscoveryGrid discoveries={discoveries} />
      </main>
    </div>
  );
}
