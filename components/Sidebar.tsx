import Link from "next/link";
import type { Profile } from "@/lib/types";

interface SidebarProps {
  profile: Profile;
}

const baseLinks = [
  { href: "/app", label: "לוח בקרה", icon: "🏠" },
  { href: "/app/calendar", label: "לוח שנה", icon: "🗓️" },
  { href: "/app/profile", label: "פרופיל", icon: "👤" },
  { href: "/app/stats", label: "סטטיסטיקות", icon: "📈" },
  { href: "/app/chat", label: "צ׳אט", icon: "💬" },
] as const;

const coachLinks = [
  { href: "/app/coach", label: "Coach", icon: "🧭" },
  { href: "/app/coach/athletes", label: "ספורטאים", icon: "🏃" },
  { href: "/app/coach/workouts", label: "אימונים", icon: "📝" },
  { href: "/app/coach/chat", label: "צ׳אט מאמן", icon: "📨" },
] as const;

export default function Sidebar({ profile }: SidebarProps) {
  const links = profile.role === "coach" ? [...baseLinks, ...coachLinks] : baseLinks;

  return (
    <aside className="w-full border-b border-navy-800 bg-navy-900 p-4 md:w-64 md:border-b-0 md:border-l">
      <nav className="grid gap-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-white"
          >
            <span className="ml-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
