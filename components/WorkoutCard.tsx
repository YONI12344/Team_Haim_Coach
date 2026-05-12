import type { Workout } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface WorkoutCardProps {
  workout: Workout;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <article className="rounded-xl border border-navy-800 bg-navy-900 p-4">
      <h3 className="text-lg font-semibold text-white">{workout.title}</h3>
      <p className="mt-1 text-sm text-gray-300">{formatDate(workout.date)}</p>
      <p className="mt-3 text-sm text-gray-200">{workout.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-accent">
        <span>{workout.type}</span>
        {workout.planned_distance_km ? <span>{workout.planned_distance_km} ק״מ</span> : null}
        {workout.planned_duration_minutes ? <span>{workout.planned_duration_minutes} דק׳</span> : null}
      </div>
    </article>
  );
}
