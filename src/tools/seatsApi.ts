type QueryValue = string | number | boolean | undefined;

interface SeatsApiRequest {
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  body?: Record<string, unknown>;
}

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

const API_BASE_URL = 'https://seats.aero/partnerapi/';

export async function requestSeatsApi(
  path: string,
  { method = 'GET', query, body }: SeatsApiRequest = {}
): Promise<unknown> {
  const apiKey = process.env.SEATS_API_KEY;

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
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Seats.aero API (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export function successResult(label: string, data: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `${label}:\n\n${JSON.stringify(data, null, 2)}`,
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
