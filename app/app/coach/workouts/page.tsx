import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, WorkoutType } from "@/lib/types";

const workoutTypes: WorkoutType[] = ["easy", "tempo", "intervals", "long_run", "rest"];

async function createWorkout(formData: FormData) {
  "use server";

  const profile = await requireCoach();
  const supabase = await createClient();

  await supabase.from("workouts").insert({
    athlete_id: String(formData.get("athlete_id")),
    coach_id: profile.id,
    date: String(formData.get("date")),
    type: formData.get("type") as WorkoutType,
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    planned_distance_km: formData.get("planned_distance_km")
      ? Number(formData.get("planned_distance_km"))
      : null,
    planned_duration_minutes: formData.get("planned_duration_minutes")
      ? Number(formData.get("planned_duration_minutes"))
      : null,
  });

  revalidatePath("/app/coach/workouts");
}

export default async function CoachWorkoutsPage() {
  await requireCoach();
  const supabase = await createClient();

  const { data: athletes } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "athlete")
    .order("full_name");
  const athleteList = (athletes ?? []) as Pick<Profile, "id" | "full_name">[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">אימונים</h2>
      <form action={createWorkout} className="grid gap-3 rounded-xl border border-navy-800 bg-navy-900 p-4">
        <label className="text-sm text-gray-300">ספורטאי</label>
        <select name="athlete_id" required className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2">
          {athleteList.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.full_name}
            </option>
          ))}
        </select>

        <label className="text-sm text-gray-300">תאריך</label>
        <input name="date" type="date" required className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2" />

        <label className="text-sm text-gray-300">סוג אימון</label>
        <select name="type" required className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2">
          {workoutTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input name="title" required placeholder="כותרת" className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2" />
        <textarea name="description" placeholder="תיאור" className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2" />

        <input
          name="planned_distance_km"
          type="number"
          step="0.1"
          placeholder="מרחק (ק״מ)"
          className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2"
        />
        <input
          name="planned_duration_minutes"
          type="number"
          placeholder="משך (דקות)"
          className="rounded-lg border border-navy-800 bg-navy-800 px-3 py-2"
        />

        <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">שמור אימון</button>
      </form>
    </section>
  );
}
