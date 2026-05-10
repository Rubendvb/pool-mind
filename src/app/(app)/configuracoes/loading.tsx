import { Skeleton } from "@/components/ui/Skeleton";

export default function ConfiguracoesLoading() {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full px-4 flex flex-col gap-4 pt-4">
      <Skeleton className="h-16" />
      <Skeleton className="h-32" />
      <Skeleton className="h-20" />
    </main>
  );
}
