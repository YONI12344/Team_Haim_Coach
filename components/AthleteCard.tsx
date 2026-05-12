import type { Profile } from "@/lib/types";

interface AthleteCardProps {
  athlete: Profile;
}

export default function AthleteCard({ athlete }: AthleteCardProps) {
  return (
    <article className="rounded-xl border border-navy-800 bg-navy-900 p-4">
      <h3 className="text-lg font-semibold text-white">{athlete.full_name}</h3>
      <p className="text-sm text-gray-300">{athlete.email}</p>
      <span className="mt-3 inline-block rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">
        ספורטאי
      </span>
    </article>
  );
}
