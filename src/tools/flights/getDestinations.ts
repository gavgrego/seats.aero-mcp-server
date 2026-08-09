import type { z } from 'zod';
import { GetDestinationsSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type GetDestinationsParams = z.infer<typeof GetDestinationsSchema>;

export async function getDestinationsTool({
  originAirport,
  destinationAirport,
}: GetDestinationsParams) {
  try {
    const destinations = await requestSeatsApi('destinations', {
      query: {
        origin_airport: originAirport,
        destination_airport: destinationAirport,
      },
    });

    return successResult('Nonstop destinations and prices', destinations);
  } catch (error) {
    return errorResult('fetching destinations', error);
  }
}
