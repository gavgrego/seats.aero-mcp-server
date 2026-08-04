import type { z } from 'zod';
import { GetRoutesSchema } from '../../schema.js';
import {
  errorResult,
  requestSeatsApi,
  successResult,
} from '../seatsApi.js';

type GetRoutesParams = z.infer<typeof GetRoutesSchema>;

export async function getRoutesTool({ source }: GetRoutesParams) {
  try {
    const routes = await requestSeatsApi('routes', {
      query: { source },
    });

    return successResult(`Routes for ${source}`, routes);
  } catch (error) {
    return errorResult('fetching routes', error);
  }
}
