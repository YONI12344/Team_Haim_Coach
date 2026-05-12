import { requireCoach } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

export default async function CoachChatPage() {
  await requireCoach();
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const messageList = (messages ?? []) as Message[];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">כל השיחות</h2>
      <div className="space-y-2">
        {messageList.map((message) => (
          <div key={message.id} className="rounded-xl border border-navy-800 bg-navy-900 p-3 text-sm">
            <p className="text-gray-300">{message.content}</p>
            <p className="mt-1 text-xs text-gray-500">{new Date(message.created_at).toLocaleString("he-IL")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
