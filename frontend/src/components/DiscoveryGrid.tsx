import { DiscoveryResponse } from "@/lib/types";
import DiscoveryCard from "@/components/DiscoveryCard";

type Props = {
  discoveries: DiscoveryResponse[];
};

export default function DiscoveryGrid({ discoveries }: Props) {
  if (discoveries.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">
        まだ発見が登録されていません。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {discoveries.map((discovery) => (
        <DiscoveryCard key={discovery.id} discovery={discovery} />
      ))}
    </div>
  );
}
