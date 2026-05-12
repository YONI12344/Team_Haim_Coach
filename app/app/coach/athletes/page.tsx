import Link from "next/link";
import AthleteCard from "@/components/AthleteCard";
import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function CoachAthletesPage() {
  await requireCoach();
  const supabase = await createClient();

  const { data: athletes } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .order("created_at", { ascending: false });
  const athleteList = (athletes ?? []) as Profile[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">ספורטאים</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {athleteList.map((athlete) => (
          <Link key={athlete.id} href={`/app/coach/athletes/${athlete.id}`}>
            <AthleteCard athlete={athlete} />
          </Link>
        ))}
      </div>
    </section>
  );
}
