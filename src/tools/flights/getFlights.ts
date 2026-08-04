import type { z } from 'zod';
import { GetFlightsSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type GetFlightsParams = z.infer<typeof GetFlightsSchema>;

export async function getFlightsTool(args: GetFlightsParams) {
  const {
    originAirport,
    destinationAirport,
    take = 500,
    include_trips = false,
    only_direct_flights = false,
    carriers,
    skip = 0,
    order_by,
    startDate,
    endDate,
    departureDate,
    cabins,
    cabinClass,
    cursor,
    sources,
    include_filtered,
    minify_trips,
  } = args;

  try {
    const flights = await requestSeatsApi('search', {
      query: {
        origin_airport: originAirport,
        destination_airport: destinationAirport,
        start_date: startDate ?? departureDate,
        end_date: endDate ?? departureDate,
        cursor,
        take,
        order_by,
        skip,
        include_trips,
        only_direct_flights,
        carriers,
        include_filtered,
        sources,
        minify_trips,
        cabins: cabins ?? cabinClass,
      },
    });

    return successResult('Flights', flights);
  } catch (error) {
    return errorResult('searching flights', error);
  }
}
