import { GetBulkAvailSchema } from '../../schema.js';
import { z } from 'zod';

type GetBulkAvailParams = z.infer<typeof GetBulkAvailSchema>;

const getBulkAvailTool = async (params: GetBulkAvailParams) => {
  try {
    const {
      source,
      cabinClass,
      startDate,
      endDate,
      originRegion,
      destinationRegion,
      cursor,
      take = 10,
      skip = 0,
    } = params;

    if (!process.env.SEATS_API_KEY) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: SEATS_API_KEY environment variable is not set',
          },
        ],
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.append('source', source.toString());
    if (cabinClass) queryParams.append('cabin', cabinClass);
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (originRegion) queryParams.append('origin_region', originRegion);
    if (destinationRegion)
      queryParams.append('destination_region', destinationRegion);
    if (cursor) queryParams.append('cursor', cursor.toString());
    queryParams.append('take', take.toString());
    queryParams.append('skip', skip.toString());

    const bulkAvail = await fetch(
      `https://seats.aero/partnerapi/availability?${queryParams.toString()}`,
      {
        headers: {
          accept: 'application/json',
          'Partner-Authorization': process.env.SEATS_API_KEY || '',
        },
      }
    );

    if (!bulkAvail.ok) {
      const errorText = await bulkAvail.text().catch(() => 'Unknown error');
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error with seats.aero API (${bulkAvail.status}): ${errorText}`,
          },
        ],
      };
    }

    const bulkAvailData = await bulkAvail.json();

    if (!bulkAvailData) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No availability found for ${source} with the specified criteria.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Flights on ${source}:\n\n${JSON.stringify(
            bulkAvailData,
            null,
            2
          )}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error searching bulk availability: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
};

export { getBulkAvailTool };
