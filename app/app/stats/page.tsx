import StatsChart from "@/components/StatsChart";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutResult } from "@/lib/types";

export default async function StatsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: results } = await supabase
    .from("workout_results")
    .select("completed_at, actual_distance_km")
    .eq("athlete_id", profile.id)
    .order("completed_at", { ascending: true });
  const resultList = (results ?? []) as Pick<WorkoutResult, "completed_at" | "actual_distance_km">[];

  const chartData = resultList.map((item) => ({
    date: item.completed_at.slice(5, 10),
    distance: item.actual_distance_km ?? 0,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">סטטיסטיקות</h2>
      <StatsChart data={chartData} />
    </section>
  );
}
