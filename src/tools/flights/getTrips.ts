import type { z } from 'zod';
import { GetTripsSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type GetTripsParams = z.infer<typeof GetTripsSchema>;

export async function getTripsTool({ id, include_filtered }: GetTripsParams) {
  try {
    const trips = await requestSeatsApi(`trips/${encodeURIComponent(id)}`, {
      query: { include_filtered },
    });

    return successResult(`Trips for availability ${id}`, trips);
  } catch (error) {
    return errorResult('fetching trips', error);
  }
}
