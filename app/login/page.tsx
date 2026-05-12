import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-navy-800 bg-navy-900 p-6 shadow-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">התחברות</h1>
        <AuthButton />
      </div>
    </main>
  );
}
