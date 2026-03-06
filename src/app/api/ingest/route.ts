import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === "signal") {
      const { source, source_url, raw_content, summary, sentiment, signal_score, category, tags } = body;
      if (!source || !raw_content) {
        return NextResponse.json({ error: "source and raw_content required" }, { status: 400 });
      }
      const { data, error } = await getSupabase()
        .from("sentiment_signals")
        .insert({ source, source_url, raw_content, summary, sentiment, signal_score, category, tags })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }

    if (type === "competitor") {
      const { competitor_name, event_type, description, source_url, severity, signal_id } = body;
      if (!competitor_name || !event_type || !description) {
        return NextResponse.json({ error: "competitor_name, event_type, description required" }, { status: 400 });
      }
      const { data, error } = await getSupabase()
        .from("competitor_intel")
        .insert({ competitor_name, event_type, description, source_url, severity, signal_id })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ error: "type must be 'signal' or 'competitor'" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
