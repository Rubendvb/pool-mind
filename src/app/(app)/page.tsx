import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { CreatePoolForm } from "@/components/dashboard/CreatePoolForm";
import { ChemicalSection } from "@/components/dashboard/ChemicalSection";
import { TasksPreview } from "@/components/dashboard/TasksPreview";
import { VolumeEditor } from "@/components/dashboard/VolumeEditor";
import { NewMeasurementButton } from "@/components/measurements/NewMeasurementButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPool } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const pool = await getPool();

  if (!pool) {
    return (
      <main className="pb-24 max-w-lg mx-auto w-full">
        <Header title="Pool Mind" subtitle="Bem-vindo!" action={<span className="text-2xl">🌊</span>} />
        <CreatePoolForm />
      </main>
    );
  }

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Pool Mind"
        subtitle={pool.name}
        action={<NewMeasurementButton poolId={pool.id} poolVolume={pool.volume} />}
      />
      <div className="px-4 flex flex-col gap-4">
        <VolumeEditor poolId={pool.id} volume={pool.volume} />
        {/* Measurements e Tasks carregam em paralelo via Suspense */}
        <Suspense fallback={<><Skeleton className="h-20" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div><Skeleton className="h-24" /></>}>
          <ChemicalSection poolId={pool.id} poolVolume={pool.volume} poolName={pool.name} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-36" />}>
          <TasksPreview />
        </Suspense>
      </div>
    </main>
  );
}
