import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function CalendarPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("athlete_id", profile.id)
    .order("date", { ascending: false })
    .limit(30);
  const workoutList = (workouts ?? []) as Workout[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">לוח שנה</h2>
      <div className="space-y-3">
        {workoutList.map((workout) => (
          <div key={workout.id} className="rounded-xl border border-navy-800 bg-navy-900 p-4">
            <p className="font-semibold">{workout.title}</p>
            <p className="text-sm text-gray-400">{formatDate(workout.date)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
