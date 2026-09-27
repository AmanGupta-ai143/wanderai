import { Sun, Wallet, Languages, Clock } from "lucide-react";
import { QuickFacts as QuickFactsType } from "@/lib/types";

const ITEMS = [
  { key: "weather", label: "Weather", icon: Sun },
  { key: "budget", label: "Budget", icon: Wallet },
  { key: "language", label: "Language", icon: Languages },
  { key: "stay", label: "Stay", icon: Clock },
] as const;

export default function QuickFacts({ facts }: { facts: QuickFactsType }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl bg-white border border-ink/8 px-5 py-5 flex items-start gap-3.5 shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-sand grid place-items-center shrink-0">
            <Icon size={16} className="text-olive" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-muted">{label}</p>
            <p className="font-display text-lg mt-0.5">{facts[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
