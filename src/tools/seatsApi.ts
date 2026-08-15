type QueryValue = string | number | boolean | undefined;

interface SeatsApiRequest {
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  body?: Record<string, unknown>;
  /** Live searches legitimately take 5-15s, so they pass a higher value. */
  timeoutMs?: number;
}

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

const API_BASE_URL = 'https://seats.aero/partnerapi/';
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_CHARS = 30_000;
const TRUNCATABLE_ARRAY_KEYS = ['data', 'results'] as const;

export async function requestSeatsApi(
  path: string,
  {
    method = 'GET',
    query,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: SeatsApiRequest = {}
): Promise<unknown> {
  const apiKey = process.env.SEATS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('SEATS_API_KEY environment variable is not set');
  }

  const url = new URL(path, API_BASE_URL);

  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(name, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      accept: 'application/json',
      'Partner-Authorization': apiKey,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after') ?? '60';
    throw new Error(
      `Seats.aero API rate limited (429). Retry-After: ${retryAfter}s. Wait before retrying with the same parameters.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Seats.aero API (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Caps tool responses at MAX_RESPONSE_CHARS so a broad query cannot flood the
 * calling agent's context. Array payloads shrink by halving while keeping
 * valid JSON plus a pagination hint; anything else falls back to a text cut.
 */
function truncateForContext(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object') {
    return payload;
  }

  const fullText = JSON.stringify(payload);
  if (fullText.length <= MAX_RESPONSE_CHARS) {
    return payload;
  }

  const record = payload as Record<string, unknown>;
  for (const key of TRUNCATABLE_ARRAY_KEYS) {
    const items = record[key];
    if (!Array.isArray(items) || items.length < 2) {
      continue;
    }
    let keep = items.length;
    while (keep > 1) {
      keep = Math.floor(keep / 2);
      const candidate = { ...record, [key]: items.slice(0, keep) };
      if (JSON.stringify(candidate).length + 150 <= MAX_RESPONSE_CHARS) {
        return {
          ...candidate,
          _mcp_truncated: `Showing ${keep} of ${items.length} results. Use skip or cursor pagination, or narrower filters (dates, cabins, sources), to retrieve more.`,
        };
      }
    }
    break;
  }

  return `${fullText.slice(0, MAX_RESPONSE_CHARS)}\n... [response truncated at ${MAX_RESPONSE_CHARS} characters]`;
}

export function successResult(label: string, data: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `${label}:\n\n${JSON.stringify(truncateForContext(data), null, 2)}`,
      },
    ],
  };
}

export function errorResult(action: string, error: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `Error ${action}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
    ],
    isError: true,
  };
}
