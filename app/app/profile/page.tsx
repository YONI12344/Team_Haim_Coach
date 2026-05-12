import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutResult } from "@/lib/types";

export default async function ProfilePage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: results } = await supabase
    .from("workout_results")
    .select("actual_distance_km, actual_duration_minutes")
    .eq("athlete_id", profile.id)
    .order("completed_at", { ascending: false });
  const resultList = (results ?? []) as Pick<
    WorkoutResult,
    "actual_distance_km" | "actual_duration_minutes"
  >[];

  const bestDistance = Math.max(...resultList.map((item) => item.actual_distance_km ?? 0), 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">פרופיל</h2>
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <p className="text-white">{profile.full_name}</p>
        <p className="text-gray-400">{profile.email}</p>
      </div>
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <p className="text-sm text-gray-400">שיא מרחק אישי</p>
        <p className="mt-2 text-3xl font-bold text-accent">{bestDistance.toFixed(1)} ק״מ</p>
      </div>
    </section>
  );
}
