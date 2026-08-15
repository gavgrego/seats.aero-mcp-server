import type { z } from 'zod';
import { GetBulkAvailSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type GetBulkAvailParams = z.infer<typeof GetBulkAvailSchema>;

export async function getBulkAvailTool(params: GetBulkAvailParams) {
  const {
    source,
    cabinClass,
    startDate,
    endDate,
    originRegion,
    destinationRegion,
    cursor,
    take = 50,
    skip = 0,
    include_filtered,
  } = params;

  try {
    const availability = await requestSeatsApi('availability', {
      query: {
        source,
        cabin: cabinClass,
        start_date: startDate,
        end_date: endDate,
        origin_region: originRegion,
        destination_region: destinationRegion,
        take,
        cursor,
        skip,
        include_filtered,
      },
    });

    return successResult(`Availability on ${source}`, availability);
  } catch (error) {
    return errorResult('searching bulk availability', error);
  }
}
