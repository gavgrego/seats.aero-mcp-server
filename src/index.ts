import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
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

const readOnlyToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

function createServer() {
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

  server.registerTool(
    'get_flights',
    {
      description: 'Get cached award flights on seats.aero.',
      inputSchema: GetFlightsSchema,
      annotations: readOnlyToolAnnotations,
    },
    getFlightsTool
  );

  server.registerTool(
    'get_bulk_avail',
    {
      description: 'Find bulk availability for a particular source.',
      inputSchema: GetBulkAvailSchema,
      annotations: readOnlyToolAnnotations,
    },
    getBulkAvailTool
  );

  server.registerTool(
    'get_routes',
    {
      description: 'Get routes for a particular source.',
      inputSchema: GetRoutesSchema,
      annotations: readOnlyToolAnnotations,
    },
    getRoutesTool
  );

  server.registerTool(
    'get_trips',
    {
      description:
        'Get flight-level trip details for a cached Availability object.',
      inputSchema: GetTripsSchema,
      annotations: readOnlyToolAnnotations,
    },
    getTripsTool
  );

  server.registerTool(
    'live_search',
    {
      description:
        'Run a live award search for one route, date, and mileage program.',
      inputSchema: LiveSearchSchema,
      annotations: readOnlyToolAnnotations,
    },
    liveSearchTool
  );

  return server;
}

serveStdio(createServer);
