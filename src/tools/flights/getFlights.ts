import type { z } from 'zod';
import { GetFlightsSchema } from './schema.js';

type GetFlightsParams = z.infer<typeof GetFlightsSchema>;

export async function getFlightsTool(args: GetFlightsParams) {
  const {
    originAirport,
    destinationAirport,
    take = 100,
    include_trips = false,
    only_direct_flights = false,
    carriers,
    skip = 0,
    order_by = 'price',
    startDate,
    endDate,
    departureDate,
    cabinClass,
  } = args;

  if (!process.env.SEATS_API_KEY) {
    throw new Error('SEATS_API_KEY environment variable is not set');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('origin_airport', originAirport.toString());
  queryParams.append('destination_airport', destinationAirport.toString());
  queryParams.append('skip', skip.toString());
  queryParams.append('order_by', order_by);
  queryParams.append('take', take.toString());
  queryParams.append('include_trips', include_trips.toString());
  queryParams.append('only_direct_flights', only_direct_flights.toString());
  if (carriers) queryParams.append('carriers', carriers);
  if (startDate) queryParams.append('start_date', startDate);
  if (endDate) queryParams.append('end_date', endDate);
  if (departureDate) queryParams.append('departure_date', departureDate);
  if (cabinClass) queryParams.append('cabin_class', cabinClass);

  const flights = await fetch(
    `https://seats.aero/partnerapi/search?${queryParams.toString()}`,
    {
      headers: {
        accept: 'application/json',
        'Partner-Authorization': process.env.SEATS_API_KEY || '',
      },
    }
  );

  const flightsData = await flights.json();

  return {
    content: [
      {
        type: 'text' as const,
        text: `Flights:\n\n${JSON.stringify(flightsData, null, 2)}`,
      },
    ],
  };
}
