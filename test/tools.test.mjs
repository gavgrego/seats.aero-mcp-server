import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  GetBulkAvailSchema,
  GetDestinationsSchema,
  LiveSearchSchema,
  RefreshCachedDataSchema,
} from '../build/schema.js';
import { getBulkAvailTool } from '../build/tools/flights/getBulkAvail.js';
import { getDestinationsTool } from '../build/tools/flights/getDestinations.js';
import { getFlightsTool } from '../build/tools/flights/getFlights.js';
import { getTripsTool } from '../build/tools/flights/getTrips.js';
import { liveSearchTool } from '../build/tools/flights/liveSearch.js';
import { refreshCachedDataTool } from '../build/tools/flights/refreshCachedData.js';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.SEATS_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;

  if (originalApiKey === undefined) {
    delete process.env.SEATS_API_KEY;
  } else {
    process.env.SEATS_API_KEY = originalApiKey;
  }
});

function mockJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

test('cached search uses documented parameters and defaults', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ data: [] });
  };

  const result = await getFlightsTool({
    originAirport: 'SFO,LAX',
    destinationAirport: 'FRA,LHR',
    departureDate: '2026-10-12',
    cabins: 'economy,business',
    cursor: 123456,
    order_by: 'lowest_mileage',
    include_filtered: true,
  });

  assert.equal(result.isError, undefined);
  const [input, init] = request;
  const url = new URL(input);
  assert.equal(url.pathname, '/partnerapi/search');
  assert.equal(url.searchParams.get('origin_airport'), 'SFO,LAX');
  assert.equal(url.searchParams.get('destination_airport'), 'FRA,LHR');
  assert.equal(url.searchParams.get('start_date'), '2026-10-12');
  assert.equal(url.searchParams.get('end_date'), '2026-10-12');
  assert.equal(url.searchParams.has('departure_date'), false);
  assert.equal(url.searchParams.get('cabins'), 'economy,business');
  assert.equal(url.searchParams.get('cursor'), '123456');
  assert.equal(url.searchParams.get('take'), '500');
  assert.equal(url.searchParams.get('order_by'), 'lowest_mileage');
  assert.equal(url.searchParams.get('include_filtered'), 'true');
  assert.equal(init.headers['Partner-Authorization'], 'test-key');
});

test('bulk availability supports regions, filtered results, and the 500-result default', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ data: [] });
  };

  await getBulkAvailTool({
    source: 'finnair',
    originRegion: 'North America',
    destinationRegion: 'Europe',
    include_filtered: true,
  });

  const url = new URL(request[0]);
  assert.equal(url.pathname, '/partnerapi/availability');
  assert.equal(url.searchParams.get('source'), 'finnair');
  assert.equal(url.searchParams.get('origin_region'), 'North America');
  assert.equal(url.searchParams.get('destination_region'), 'Europe');
  assert.equal(url.searchParams.get('include_filtered'), 'true');
  assert.equal(url.searchParams.get('take'), '500');
  assert.equal(url.searchParams.get('skip'), '0');
});

test('get trips encodes the availability ID and forwards include_filtered', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ data: [] });
  };

  await getTripsTool({ id: 'availability/id', include_filtered: true });

  const url = new URL(request[0]);
  assert.equal(url.pathname, '/partnerapi/trips/availability%2Fid');
  assert.equal(url.searchParams.get('include_filtered'), 'true');
});

test('get destinations sends exactly one airport direction', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ destinations: [] });
  };

  await getDestinationsTool({ originAirport: 'SFO' });

  const url = new URL(request[0]);
  assert.equal(url.pathname, '/partnerapi/destinations');
  assert.equal(url.searchParams.get('origin_airport'), 'SFO');
  assert.equal(url.searchParams.has('destination_airport'), false);
});

test('destination schema requires exactly one origin or destination', () => {
  assert.equal(
    GetDestinationsSchema.safeParse({ originAirport: 'SFO' }).success,
    true
  );
  assert.equal(
    GetDestinationsSchema.safeParse({ destinationAirport: 'JFK' }).success,
    true
  );
  assert.equal(GetDestinationsSchema.safeParse({}).success, false);
  assert.equal(
    GetDestinationsSchema.safeParse({
      originAirport: 'SFO',
      destinationAirport: 'JFK',
    }).success,
    false
  );
});

test('refresh cached data sends 1-250 availability IDs as JSON', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ complete: false });
  };

  await refreshCachedDataTool({
    availabilityIds: ['availability-1', 'availability-2'],
  });

  const [input, init] = request;
  const url = new URL(input);
  assert.equal(url.pathname, '/partnerapi/refresh');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(init.body), {
    availability_ids: ['availability-1', 'availability-2'],
  });
  assert.equal(
    RefreshCachedDataSchema.safeParse({ availabilityIds: [] }).success,
    false
  );
  assert.equal(
    RefreshCachedDataSchema.safeParse({
      availabilityIds: Array.from({ length: 251 }, (_, index) => String(index)),
    }).success,
    false
  );
});

test('live search sends the documented JSON request body', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  let request;
  globalThis.fetch = async (...args) => {
    request = args;
    return mockJsonResponse({ results: [], success: true });
  };

  await liveSearchTool({
    originAirport: 'SFO',
    destinationAirport: 'LHR',
    departureDate: '2026-11-03',
    source: 'lufthansa',
    show_dynamic_pricing: true,
    seat_count: 2,
  });

  const [input, init] = request;
  const url = new URL(input);
  assert.equal(url.pathname, '/partnerapi/live');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(init.body), {
    origin_airport: 'SFO',
    destination_airport: 'LHR',
    departure_date: '2026-11-03',
    source: 'lufthansa',
    disable_filters: false,
    show_dynamic_pricing: true,
    seat_count: 2,
  });
});

test('schemas include current sources and enforce documented live seat counts', () => {
  assert.equal(
    GetBulkAvailSchema.safeParse({ source: 'spirit' }).success,
    true
  );
  assert.equal(
    LiveSearchSchema.safeParse({
      originAirport: 'SFO',
      destinationAirport: 'LHR',
      departureDate: '2026-11-03',
      source: 'aeroplan',
      seat_count: 10,
    }).success,
    false
  );
});

test('missing credentials return an MCP tool error without making a request', async () => {
  delete process.env.SEATS_API_KEY;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return mockJsonResponse({});
  };

  const result = await getTripsTool({ id: 'availability-id' });

  assert.equal(called, false);
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /SEATS_API_KEY/);
});

test('Seats.aero HTTP failures are returned as MCP tool errors', async () => {
  process.env.SEATS_API_KEY = 'test-key';
  globalThis.fetch = async () => mockJsonResponse({ error: 'bad request' }, 400);

  const result = await getFlightsTool({
    originAirport: 'SFO',
    destinationAirport: 'LHR',
  });

  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Seats\.aero API \(400\)/);
});
