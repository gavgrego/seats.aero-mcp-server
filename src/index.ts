import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getFlightsTool } from './tools/flights/getFlights.js';
import {
  GetBulkAvailSchema,
  GetFlightsSchema,
} from './tools/flights/schema.js';
import { getBulkAvailTool } from './tools/flights/getBulkAvail.js';

const server = new McpServer({
  name: 'seats-mcp',
  version: '1.0.0',
});

server.tool(
  'get_flights',
  'Get cached award flights on seats.aero',
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

const transport = new StdioServerTransport();
await server.connect(transport);
