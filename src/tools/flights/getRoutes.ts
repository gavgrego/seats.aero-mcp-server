import { z } from 'zod';
import { GetRoutesSchema } from './schema.js';

type GetRoutesParams = z.infer<typeof GetRoutesSchema>;

export async function getRoutesTool(args: GetRoutesParams) {
  try {
    const { source } = args;

    if (!process.env.SEATS_API_KEY) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: SEATS_API_KEY environment variable is not set',
          },
        ],
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.append('source', source.toString());

    const routes = await fetch(
      `https://seats.aero/partnerapi/routes?${queryParams.toString()}`,
      {
        headers: {
          accept: 'application/json',
          'Partner-Authorization': process.env.SEATS_API_KEY || '',
        },
      }
    );

    if (!routes.ok) {
      const errorText = await routes.text().catch(() => 'Unknown error');
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error with seats.aero API (${routes.status}): ${errorText}`,
          },
        ],
      };
    }

    const routesData = await routes.json();

    if (!routesData) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No routes found for ${source}.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Routes:\n\n${JSON.stringify(routesData, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching routes: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
}
