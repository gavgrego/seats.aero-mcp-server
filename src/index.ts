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
