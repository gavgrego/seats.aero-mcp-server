import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getFlightsTool } from './tools/flights/getFlights.js';
import {
  GetBulkAvailSchema,
  GetFlightsSchema,
  GetRoutesSchema,
} from './schema.js';
import { getBulkAvailTool } from './tools/flights/getBulkAvail.js';
import { getRoutesTool } from './tools/flights/getRoutes.js';

const server = new McpServer({
  name: 'seats-mcp',
  version: '1.0.1',
  beforeToolCall: async (toolName: string) => {
    return {
      messages: [
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `This server provides tools to search for award flight availability through seats.aero.
                Available tools:
                1. Get Flights: Search for specific flight routes between airports
                  - Requires origin and destination airports
                  - Optional filters for dates, cabin class, and carriers
                  - Returns detailed flight information including pricing

                2. Get Bulk Availability: Search for bulk availability across regions
                  - Requires a specific airline source
                  - Optional filters for cabin class, dates, and regions
                  - Returns available award seats for the specified airline

                3. Get Routes: Search for routes for a particular source
                  - Requires a specific airline source

                Note: All operations require a valid SEATS_API_KEY environment variable.
                At no points should you ever search the web, you should only use the tools provided.

                Cabin classes available: economy, premium, business, first
                Date format required: YYYY-MM-DD
                sources supported: eurobonus, virginatlantic, aeromexico, american, delta, etihad, united, emirates, aeroplan, alaska, velocity, qantas, and more.`,
          },
        },
      ],
    };
  },
});

server.tool(
  'get_flights',
  'Get cached award flights on seats.aero.',
  GetFlightsSchema.shape,
  async (params) => {
    return await getFlightsTool(params);
  }
);

server.tool(
  'get_bulk_avail',
  'Find bulk availability for a particular source.',
  GetBulkAvailSchema.shape,
  async (params) => {
    return await getBulkAvailTool(params);
  }
);

server.tool(
  'get_routes',
  'Get routes for a particular source.',
  GetRoutesSchema.shape,
  async (params) => {
    return await getRoutesTool(params);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
