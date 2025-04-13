import { z } from 'zod';
import { GetRoutesSchema } from './schema.js';

type GetRoutesParams = z.infer<typeof GetRoutesSchema>;

export async function getRoutesTool(args: GetRoutesParams) {
  const { source } = args;

  if (!process.env.SEATS_API_KEY) {
    throw new Error('SEATS_API_KEY environment variable is not set');
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

  const routesData = await routes.json();

  return {
    content: [
      {
        type: 'text' as const,
        text: `Routes:\n\n${JSON.stringify(routesData, null, 2)}`,
      },
    ],
  };
}
