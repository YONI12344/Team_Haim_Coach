export function formatPace(distanceKm: number, durationMinutes: number): string {
  if (!distanceKm || !durationMinutes) return "--";
  const minutesPerKm = durationMinutes / distanceKm;
  const min = Math.floor(minutesPerKm);
  const sec = Math.round((minutesPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")} דק׳/ק"מ`;
}

export function formatTime(totalMinutes: number): string {
  if (!totalMinutes) return "0 דק׳";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} דק׳`;
  return `${hours} ש׳ ${minutes} דק׳`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
