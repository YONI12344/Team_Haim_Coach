import Link from "next/link";
import type { Profile } from "@/lib/types";

interface HeaderProps {
  profile: Profile;
}

export default function Header({ profile }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-navy-800 bg-navy-900/90 px-4 py-3">
      <h1 className="text-lg font-semibold text-white">Team Haim</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-200">{profile.full_name}</span>
        <Link
          href="/api/auth/signout"
          className="rounded-lg border border-accent px-3 py-1 text-sm text-accent hover:bg-accent hover:text-black"
        >
          התנתק
        </Link>
      </div>
    </header>
  );
}
