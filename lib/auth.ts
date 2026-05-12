import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    return data as Profile;
  }

  // User is authenticated but has no profile row — auto-create one to prevent redirect loops.
  const fullName: string =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Unknown User";

  const { data: upserted, error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      role: "athlete",
    })
    .select("*")
    .single();

  if (upsertError) {
    console.error("Failed to auto-create profile:", upsertError.message);
    return null;
  }

  return (upserted as Profile | null) ?? null;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireCoach(): Promise<Profile> {
  const profile = await requireAuth();
  if (profile.role !== "coach") {
    redirect("/app");
  }
  return profile;
}
