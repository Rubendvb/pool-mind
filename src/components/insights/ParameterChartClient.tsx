"use client";
import dynamic from "next/dynamic";
import type { Measurement } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

const ParameterChart = dynamic(
  () => import("./ParameterChart").then((m) => m.ParameterChart),
  { ssr: false, loading: () => <Skeleton className="h-48" /> }
);

export function ParameterChartClient({ measurements }: { measurements: Measurement[] }) {
  return <ParameterChart measurements={measurements} />;
}
