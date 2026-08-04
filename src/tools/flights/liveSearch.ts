import type { z } from 'zod';
import { LiveSearchSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type LiveSearchParams = z.infer<typeof LiveSearchSchema>;

export async function liveSearchTool({
  originAirport,
  destinationAirport,
  departureDate,
  source,
  disable_filters = false,
  show_dynamic_pricing = false,
  seat_count = 1,
}: LiveSearchParams) {
  try {
    const results = await requestSeatsApi('live', {
      method: 'POST',
      body: {
        origin_airport: originAirport,
        destination_airport: destinationAirport,
        departure_date: departureDate,
        source,
        disable_filters,
        show_dynamic_pricing,
        seat_count,
      },
    });

    return successResult('Live search results', results);
  } catch (error) {
    return errorResult('running live search', error);
  }
}
