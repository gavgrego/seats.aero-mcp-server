import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  GetBulkAvailSchema,
  GetFlightsSchema,
  GetRoutesSchema,
  GetTripsSchema,
  LiveSearchSchema,
} from './schema.js';
import { getBulkAvailTool } from './tools/flights/getBulkAvail.js';
import { getFlightsTool } from './tools/flights/getFlights.js';
import { getRoutesTool } from './tools/flights/getRoutes.js';
import { getTripsTool } from './tools/flights/getTrips.js';
import { liveSearchTool } from './tools/flights/liveSearch.js';

const server = new McpServer(
  {
    name: 'seats-mcp',
    version: '1.1.0',
  },
  {
    instructions: `This server provides tools to search for award flight availability through seats.aero.

Available tools:
1. get_flights: Search for specific flight routes between airports
   - Requires origin and destination airports
   - Optional filters for dates, cabin class, and carriers
   - Returns detailed flight information including pricing

2. get_bulk_avail: Search cached bulk availability across regions
   - Requires a specific airline source
   - Optional filters for cabin class, dates, and regions
   - Returns available award seats for the specified airline

3. get_routes: Search for routes for a particular source
   - Requires a specific airline source

4. get_trips: Retrieve flight-level details for an availability result
   - Requires an Availability object ID returned by a cached search

5. live_search: Run a live search for an exact route and date
   - Requires origin, destination, departure date, and mileage program source
   - Can take longer than cached searches and consumes a partner API call

Note: All operations require a valid SEATS_API_KEY environment variable.
You should only use the tools provided by this server for flight searches.

Cabin classes available: economy, premium, business, first
Date format required: YYYY-MM-DD
Sources supported: eurobonus, virginatlantic, aeromexico, american, delta, etihad, united, emirates, aeroplan, alaska, velocity, qantas, connectmiles, azul, smiles, flyingblue, jetblue, qatar, turkish, singapore, ethiopian, saudia, finnair, lufthansa, frontier, and spirit.`,
  }
);

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

server.tool(
  'get_trips',
  'Get flight-level trip details for a cached Availability object.',
  GetTripsSchema.shape,
  async (params) => {
    return await getTripsTool(params);
  }
);

server.tool(
  'live_search',
  'Run a live award search for one route, date, and mileage program.',
  LiveSearchSchema.shape,
  async (params) => {
    return await liveSearchTool(params);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
