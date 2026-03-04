/**
 * Nexus Gateway Client — Telemetry Bridge
 *
 * All external data routing for the Intelligence Radar satellite flows
 * exclusively through the central Velosym Nexus API Gateway.
 */

const NEXUS_BASE_URL = process.env.NEXT_PUBLIC_NEXUS_GATEWAY_URL ?? "https://nexus.velosym.com";
const NEXUS_API_KEY = process.env.NEXUS_API_KEY ?? "";

interface NexusRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

interface NexusResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

async function nexusFetch<T = unknown>(
  path: string,
  opts: NexusRequestOptions = {}
): Promise<NexusResponse<T>> {
  const { method = "GET", body, headers = {} } = opts;

  const res = await fetch(`${NEXUS_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-nexus-key": NEXUS_API_KEY,
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = (await res.json().catch(() => null)) as T;
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export interface TelemetryEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export async function sendTelemetry(events: TelemetryEvent[]) {
  return nexusFetch("/v1/telemetry/ingest", {
    method: "POST",
    body: { source: "intelligence-radar", events },
  });
}

// ---------------------------------------------------------------------------
// Intelligence Data Fetching (via Nexus proxy)
// ---------------------------------------------------------------------------

export async function fetchSentimentFeed(query: string, limit = 50) {
  return nexusFetch(`/v1/intel/sentiment?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function fetchCompetitorSignals(competitor: string, limit = 50) {
  return nexusFetch(`/v1/intel/competitors?name=${encodeURIComponent(competitor)}&limit=${limit}`);
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function nexusHealthCheck() {
  return nexusFetch<{ status: string }>("/v1/health");
}
