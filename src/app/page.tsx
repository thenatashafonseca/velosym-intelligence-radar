import SentimentFeed from "@/components/SentimentFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8 font-mono">
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">INTELLIGENCE RADAR</h1>
        <p className="text-xs text-zinc-500 mt-1">Velosym Sentiment Signal Feed</p>
      </header>
      <main>
        <SentimentFeed />
      </main>
    </div>
  );
}
