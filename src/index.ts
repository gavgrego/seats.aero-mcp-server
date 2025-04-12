import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getFlightsTool } from './tools/flights/getFlights.ts';
import { GetFlightsSchema } from './tools/flights/schema.ts';

const server = new McpServer({
  name: 'seats-mcp',
  version: '1.0.0',
});

server.tool(
  'get_flights',
  'Find award flights on seats.aero',
  async (params) => {
    const validatedParams = GetFlightsSchema.parse(params);
    return await getFlightsTool(validatedParams);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
