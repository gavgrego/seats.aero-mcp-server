import { z } from 'zod';
import { GetTripsSchema } from '../../schema.js';

type GetTripsParams = z.infer<typeof GetTripsSchema>;

export async function getTripsTool(args: GetTripsParams) {
  try {
    const { id, include_filtered } = args;

    if (!process.env.SEATS_API_KEY) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: SEATS_API_KEY environment variable is not set',
          },
        ],
        isError: true,
      };
    }

    const queryParams = new URLSearchParams();
    if (include_filtered !== undefined)
      queryParams.append('include_filtered', include_filtered.toString());

    const url = `https://seats.aero/partnerapi/trips/${encodeURIComponent(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'Partner-Authorization': process.env.SEATS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error with seats.aero API (${response.status}): ${errorText}`,
          },
        ],
        isError: true,
      };
    }

    const tripsData = await response.json();

    if (!tripsData) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No trips found for availability ID: ${id}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Trips for availability ${id}:\n\n${JSON.stringify(tripsData, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching trips: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
      isError: true,
    };
  }
}
