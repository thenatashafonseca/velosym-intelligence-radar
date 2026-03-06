"use client";

import { useEffect, useState } from "react";
import { createPublicClient } from "@/lib/supabase";

type Signal = {
  id: string;
  source: string;
  raw_content: string;
  summary: string | null;
  sentiment: string | null;
  signal_score: number;
  category: string | null;
  ingested_at: string;
};

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "border-green-600",
  negative: "border-red-600",
  neutral: "border-zinc-400",
  mixed: "border-yellow-500",
};

export default function SentimentFeed() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createPublicClient();
    sb.from("sentiment_signals")
      .select("id, source, raw_content, summary, sentiment, signal_score, category, ingested_at")
      .order("ingested_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setSignals(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-zinc-500 font-mono text-sm">Loading signals...</p>;
  if (!signals.length) return <p className="text-zinc-500 font-mono text-sm">No signals ingested yet.</p>;

  return (
    <div className="flex flex-col gap-2">
      {signals.map((s) => (
        <div
          key={s.id}
          className={`border-l-4 ${SENTIMENT_COLOR[s.sentiment ?? "neutral"]} bg-zinc-950 p-3 font-mono text-sm`}
        >
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{s.source} · {s.category ?? "uncategorized"}</span>
            <span>score: {s.signal_score}</span>
          </div>
          <p className="mt-1 text-zinc-200">{s.summary ?? s.raw_content}</p>
          <time className="mt-1 block text-xs text-zinc-600">
            {new Date(s.ingested_at).toLocaleString()}
          </time>
        </div>
      ))}
    </div>
  );
}
