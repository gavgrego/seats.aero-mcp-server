import type { z } from 'zod';
import { RefreshCachedDataSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type RefreshCachedDataParams = z.infer<typeof RefreshCachedDataSchema>;

export async function refreshCachedDataTool({
  availabilityIds,
}: RefreshCachedDataParams) {
  try {
    const status = await requestSeatsApi('refresh', {
      method: 'POST',
      body: { availability_ids: availabilityIds },
    });

    return successResult('Cached data refresh status', status);
  } catch (error) {
    return errorResult('refreshing cached data', error);
  }
}
