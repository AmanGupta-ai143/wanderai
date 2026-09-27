"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send } from "lucide-react";
import { Destination } from "@/lib/types";
import { SUGGESTED_QUESTIONS } from "@/lib/client/chatAssistant";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const destSlug = pathname.match(/^\/destinations\/([^/]+)/)?.[1];

  useEffect(() => {
    if (!destSlug) {
      setDestination(null);
      return;
    }
    fetch(`/api/destinations/${destSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDestination(d?.destination ?? null));
  }, [destSlug]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: destination
            ? `Hi! I'm your ${destination.name} guide. What would you like to know?`
            : "Hi! Browse to a destination and I can answer questions about it — places to visit, food, packing, budget and more.",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const [sending, setSending] = useState(false);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, destinationSlug: destSlug ?? null }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer ?? "Sorry, something went wrong — try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong — try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-terracotta text-paper shadow-xl grid place-items-center hover:bg-terracotta/90 transition-colors"
        aria-label="Ask WanderAI"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-40 md:bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm h-[420px] bg-paper rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden">
          <div className="bg-ink text-paper px-5 py-4">
            <p className="font-display text-lg flex items-center gap-2">
              <Sparkles size={15} className="text-gold" /> WanderAI
            </p>
            <p className="text-xs text-paper/60 mt-0.5">
              {destination ? `Your ${destination.name} guide` : "Your travel companion"}
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-terracotta text-paper ml-auto rounded-br-sm"
                    : "bg-sand text-ink rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            ))}

            {sending && (
              <div className="bg-sand text-ink rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm w-fit flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce" />
              </div>
            )}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs bg-white border border-ink/10 rounded-full px-3 py-1.5 hover:border-terracotta/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-ink/10 p-3 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 bg-sand/50 rounded-full px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-ink text-paper grid place-items-center shrink-0 hover:bg-ink/90 transition-colors"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
