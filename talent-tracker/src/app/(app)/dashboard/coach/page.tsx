"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", content: "Hi! I'm your AI job coach. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg].slice(-12) }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: data.reply }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-3 border rounded">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={"inline-block px-3 py-2 rounded " + (m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800")}>{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input className="flex-1 border rounded px-3 py-2 bg-transparent" placeholder="Ask about resumes, outreach, interviews…" value={input} onChange={(e) => setInput(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 border rounded">{loading ? "Sending…" : "Send"}</button>
      </form>
    </div>
  );
}

