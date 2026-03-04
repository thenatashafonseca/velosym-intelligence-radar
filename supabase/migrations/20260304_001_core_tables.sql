-- CYCLE 002: Intelligence Radar — Core Tables Migration
-- Enforces strict RLS on all tables.

-- =============================================================================
-- 1. sentiment_signals
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sentiment_signals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source        text NOT NULL,                -- e.g. 'twitter', 'reddit', 'news'
  query         text NOT NULL,                -- search term / topic tracked
  sentiment     real NOT NULL CHECK (sentiment >= -1 AND sentiment <= 1),
  magnitude     real NOT NULL DEFAULT 0 CHECK (magnitude >= 0),
  raw_text      text,
  metadata      jsonb DEFAULT '{}'::jsonb,
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  ingested_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sentiment_signals ENABLE ROW LEVEL SECURITY;

-- Service-role can insert (ingestion pipeline)
CREATE POLICY "service_insert_sentiment" ON public.sentiment_signals
  FOR INSERT TO service_role WITH CHECK (true);

-- Service-role can read all
CREATE POLICY "service_select_sentiment" ON public.sentiment_signals
  FOR SELECT TO service_role USING (true);

-- Authenticated users can read only
CREATE POLICY "authenticated_read_sentiment" ON public.sentiment_signals
  FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- 2. competitor_intel
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.competitor_intel (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  signal_type     text NOT NULL,              -- e.g. 'pricing', 'feature_launch', 'hiring', 'funding'
  title           text NOT NULL,
  summary         text,
  source_url      text,
  confidence      real NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  metadata        jsonb DEFAULT '{}'::jsonb,
  detected_at     timestamptz NOT NULL DEFAULT now(),
  ingested_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.competitor_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_insert_competitor" ON public.competitor_intel
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service_select_competitor" ON public.competitor_intel
  FOR SELECT TO service_role USING (true);

CREATE POLICY "authenticated_read_competitor" ON public.competitor_intel
  FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- 3. radar_config
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.radar_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text UNIQUE NOT NULL,       -- config identifier
  value           jsonb NOT NULL,
  description     text,
  updated_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.radar_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_config" ON public.radar_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_config" ON public.radar_config
  FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX idx_sentiment_source_recorded ON public.sentiment_signals (source, recorded_at DESC);
CREATE INDEX idx_sentiment_query ON public.sentiment_signals (query);
CREATE INDEX idx_competitor_name_detected ON public.competitor_intel (competitor_name, detected_at DESC);
CREATE INDEX idx_competitor_signal_type ON public.competitor_intel (signal_type);
CREATE INDEX idx_radar_config_key ON public.radar_config (key);
