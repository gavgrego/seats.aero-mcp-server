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
  GetTripsSchema,
} from './schema.js';
import { getBulkAvailTool } from './tools/flights/getBulkAvail.js';
import { getRoutesTool } from './tools/flights/getRoutes.js';
import { getTripsTool } from './tools/flights/getTrips.js';

const server = new McpServer(
  {
    name: 'seats-mcp',
    version: '1.0.1',
  },
  {
    instructions: `This server provides tools to search for award flight availability through seats.aero.

## Recommended workflow

To find award flights with departure/arrival times:
1. Call get_flights with origin, destination, date range, and cabinClass to get availability summaries.
   - Filter results by JAvailable=true (business) or YAvailable=true (economy) and RemainingSeats > 0.
   - Each result has an "ID" field — this is the availability ID.
2. Call get_trips with the availability ID to get full itinerary details: segment times, flight numbers, aircraft, booking links.
   - get_trips returns ALL possible itineraries for that availability (many may have 0 seats).
   - Filter trips by RemainingSeats > 0 and Cabin = your target class.
   - DepartsAt/ArrivesAt times are in UTC. Convert to local time for display (e.g. Aug in New York = UTC-4, London = UTC+1, Rome = UTC+2).

For broad exploration (e.g. "what's available from the US to Europe this summer"), use get_bulk_avail with a source program, then drill into specific IDs with get_trips.

## Tools

1. get_flights — search by route
   - Required: originAirport, destinationAirport
   - Optional: startDate/endDate (YYYY-MM-DD), cabinClass, carriers (2-letter IATA code), take (max 1000)
   - Returns availability per date: mileage cost, taxes, seat count, airlines, direct flag

2. get_bulk_avail — search by loyalty program across regions
   - Required: source (loyalty program slug)
   - Optional: cabinClass, startDate/endDate, originRegion/destinationRegion
   - Good for "what can I book with my United miles?" style queries

3. get_routes — list all routes tracked for a given source program
   - Required: source

4. get_trips — get full itinerary details for an availability ID
   - Required: id (availability ID from get_flights or get_bulk_avail)
   - Optional: include_filtered (include pricier dynamically-priced results)
   - Returns: segments with DepartsAt/ArrivesAt, FlightNumber, AircraftName, Cabin, Stops, booking links

## Key data notes

- Mileage costs and taxes are per person one-way. Taxes stored in cents (e.g. 75480 = $754.80).
- RemainingSeats is an estimate; actual availability must be confirmed at booking.
- Data is cached and refreshed periodically — not real-time. Use booking links to confirm live availability.
- Cabin field on segments reflects the actual cabin booked (e.g. a BA codeshare on AAdvantage shows "business").

## Cabin classes
economy, premium, business, first

## Date format
YYYY-MM-DD

## Sources (loyalty programs)
american, delta, united, aeroplan, alaska, flyingblue, virginatlantic, eurobonus, emirates, etihad, qantas, velocity, jetblue, aeromexico, connectmiles, azul, smiles, qatar, turkish, singapore, ethiopian, saudia

Note: All operations require a valid SEATS_API_KEY environment variable.
You should only use the tools provided by this server for flight searches.`,
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
  'Get detailed itinerary (departure/arrival times, flight numbers, segments, booking links) for a specific availability ID from seats.aero.',
  GetTripsSchema.shape,
  async (params) => {
    return await getTripsTool(params);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
