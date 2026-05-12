import WorkoutCard from "@/components/WorkoutCard";
import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Workout } from "@/lib/types";

interface CoachAthleteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoachAthleteDetailPage({ params }: CoachAthleteDetailPageProps) {
  await requireCoach();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: athlete }, { data: workouts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("workouts").select("*").eq("athlete_id", id).order("date", { ascending: false }).limit(10),
  ]);
  const selectedAthlete = athlete as Profile | null;
  const workoutList = (workouts ?? []) as Workout[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">תצוגת ספורטאי</h2>
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <p className="text-lg font-semibold text-white">{selectedAthlete?.full_name}</p>
        <p className="text-sm text-gray-300">{selectedAthlete?.email}</p>
      </div>
      <div className="space-y-3">
        {workoutList.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </section>
  );
}
