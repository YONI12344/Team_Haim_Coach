"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (!error) {
      router.push("/login/check-email");
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
      >
        התחבר עם Google
      </button>

      <div className="text-center text-sm text-gray-400">או</div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <label className="block text-sm text-gray-300">התחבר עם אימייל</label>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-navy-800 bg-navy-800 px-3 py-2 text-white"
          placeholder="name@example.com"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-accent px-4 py-2 text-accent hover:bg-accent hover:text-black disabled:opacity-50"
        >
          שלח קישור
        </button>
      </form>
    </div>
  );
}
