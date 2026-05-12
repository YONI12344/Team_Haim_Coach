import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CoachPage() {
  await requireCoach();
  const supabase = await createClient();

  const { count: athletesCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "athlete");

  const { count: workoutsCount } = await supabase
    .from("workouts")
    .select("id", { count: "exact", head: true });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Coach Dashboard</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <p className="text-sm text-gray-400">ספורטאים</p>
          <p className="mt-2 text-3xl font-bold text-accent">{athletesCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <p className="text-sm text-gray-400">אימונים</p>
          <p className="mt-2 text-3xl font-bold text-accent">{workoutsCount ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
