import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import {
  GetBulkAvailSchema,
  GetDestinationsSchema,
  GetFlightsSchema,
  GetRoutesSchema,
  GetTripsSchema,
  LiveSearchSchema,
  RefreshCachedDataSchema,
} from './schema.js';
import { getBulkAvailTool } from './tools/flights/getBulkAvail.js';
import { getDestinationsTool } from './tools/flights/getDestinations.js';
import { getFlightsTool } from './tools/flights/getFlights.js';
import { getRoutesTool } from './tools/flights/getRoutes.js';
import { getTripsTool } from './tools/flights/getTrips.js';
import { liveSearchTool } from './tools/flights/liveSearch.js';
import { refreshCachedDataTool } from './tools/flights/refreshCachedData.js';

const readOnlyToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

const refreshToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

function createServer() {
  const server = new McpServer(
    {
      name: 'seats-mcp',
      version: '1.2.0', // x-release-please-version
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

4. get_destinations: Find airports reachable nonstop from or to one airport
   - Requires exactly one origin or destination airport
   - Returns the cheapest raw nonstop mileage price per cabin

5. get_trips: Retrieve flight-level details for an availability result
   - Requires an Availability object ID returned by a cached search

6. refresh_cached_data: Queue or poll a refresh for cached Availability objects
   - Accepts 1-250 Availability IDs from cached search or bulk availability
   - Cannot be used by commercial users; commercial users should use live_search

7. live_search: Run a live search for an exact route and date
   - Requires origin, destination, departure date, and mileage program source
   - Requires a commercial agreement with Seats.aero
   - Cannot be used by Seats.aero Pro users
   - Can take 5-15 seconds; failed searches should use limited exponential-backoff retries

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
    'get_destinations',
    {
      description:
        'Find airports reachable nonstop from or to one airport, with the cheapest raw mileage price per cabin.',
      inputSchema: GetDestinationsSchema,
      annotations: readOnlyToolAnnotations,
    },
    getDestinationsTool
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
    'refresh_cached_data',
    {
      description:
        'Queue or poll refreshes for 1-250 cached Availability objects. This endpoint cannot be used by commercial users; commercial users should use live_search instead.',
      inputSchema: RefreshCachedDataSchema,
      annotations: refreshToolAnnotations,
      _meta: {
        'seats.aero/access': 'pro-only',
        'seats.aero/commercial-users-supported': false,
      },
    },
    refreshCachedDataTool
  );

  server.registerTool(
    'live_search',
    {
      description:
        'Run a live award search for one route, date, and mileage program. This endpoint cannot be used by Seats.aero Pro users and requires a commercial agreement with Seats.aero.',
      inputSchema: LiveSearchSchema,
      annotations: readOnlyToolAnnotations,
      _meta: {
        'seats.aero/access': 'commercial-agreement-required',
        'seats.aero/pro-users-supported': false,
      },
    },
    liveSearchTool
  );

  return server;
}

serveStdio(createServer);
