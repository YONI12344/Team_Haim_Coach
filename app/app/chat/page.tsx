import ChatWindow from "@/components/ChatWindow";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Message, Profile } from "@/lib/types";

export default async function ChatPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "coach")
    .limit(1)
    .maybeSingle();
  const coach = coachProfile as Pick<Profile, "id"> | null;

  const partnerId = coach?.id ?? profile.id;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile.id})`)
    .order("created_at", { ascending: true });
  const messageList = (messages ?? []) as Message[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">צ׳אט</h2>
      <ChatWindow currentUserId={profile.id} partnerId={partnerId} initialMessages={messageList} />
    </section>
  );
}
