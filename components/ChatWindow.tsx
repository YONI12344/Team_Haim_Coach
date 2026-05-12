"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

interface ChatWindowProps {
  currentUserId: string;
  partnerId: string;
  initialMessages: Message[];
}

export default function ChatWindow({ currentUserId, partnerId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${currentUserId}:${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${partnerId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          setMessages((previous) => [...previous, message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, partnerId, supabase]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;

    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: partnerId,
        content,
      })
      .select("*")
      .single();

    if (data) {
      setMessages((previous) => [...previous, data as Message]);
    }

    setContent("");
  }

  return (
    <section className="flex h-[70vh] flex-col rounded-xl border border-navy-800 bg-navy-900">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`max-w-[80%] rounded-lg p-3 text-sm ${mine ? "mr-auto bg-accent text-black" : "bg-navy-800 text-white"}`}>
              {message.content}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="border-t border-navy-800 p-3">
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="flex-1 rounded-lg border border-navy-800 bg-navy-800 px-3 py-2 text-white"
            placeholder="כתוב הודעה..."
          />
          <button className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">שלח</button>
        </div>
      </form>
    </section>
  );
}
