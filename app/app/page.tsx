import WorkoutCard from "@/components/WorkoutCard";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("athlete_id", profile.id)
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const todaysWorkout = workout as Workout | null;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const { data: weekWorkouts } = await supabase
    .from("workouts")
    .select("status, planned_distance_km")
    .eq("athlete_id", profile.id)
    .gte("date", weekStart.toISOString().slice(0, 10));
  const weeklyList = (weekWorkouts ?? []) as Pick<Workout, "status" | "planned_distance_km">[];

  const totalKm = weeklyList.reduce((sum, item) => sum + (item.planned_distance_km ?? 0), 0);
  const done = weeklyList.filter((item) => item.status === "completed").length;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">שלום, {profile.full_name}!</h2>

      <div>
        <h3 className="mb-2 text-lg font-semibold">אימון היום</h3>
        {todaysWorkout ? (
          <WorkoutCard workout={todaysWorkout} />
        ) : (
          <div className="rounded-xl border border-dashed border-navy-700 p-4 text-gray-400">אין אימון מתוכנן להיום</div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <p className="text-sm text-gray-400">סיכום שבועי</p>
          <p className="mt-2 text-3xl font-bold text-accent">{totalKm.toFixed(1)} ק״מ</p>
        </div>
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <p className="text-sm text-gray-400">אימונים שבוצעו</p>
          <p className="mt-2 text-3xl font-bold text-accent">{done}</p>
        </div>
      </div>
    </section>
  );
}
