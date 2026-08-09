import assert from 'node:assert/strict';
import test from 'node:test';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('server advertises all current Seats.aero tools with JSON schemas', async () => {
  const client = new Client({ name: 'seats-mcp-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['build/index.js'],
    cwd: process.cwd(),
    env: { SEATS_API_KEY: 'test-key' },
    stderr: 'pipe',
  });

  try {
    await client.connect(transport);
    const response = await client.listTools();
    const tools = new Map(response.tools.map((tool) => [tool.name, tool]));

    assert.deepEqual([...tools.keys()].sort(), [
      'get_bulk_avail',
      'get_destinations',
      'get_flights',
      'get_routes',
      'get_trips',
      'live_search',
      'refresh_cached_data',
    ]);
    assert.equal(
      tools.get('get_flights').inputSchema.properties.cabins.type,
      'string'
    );
    assert.match(
      tools.get('get_flights').inputSchema.properties.cabins.description,
      /comma-delimited/
    );
    assert.equal(tools.get('live_search').annotations.readOnlyHint, true);
    assert.match(tools.get('live_search').description, /cannot be used.*Pro/i);
    assert.equal(
      tools.get('live_search')._meta['seats.aero/access'],
      'commercial-agreement-required'
    );
    assert.equal(
      tools.get('refresh_cached_data')._meta['seats.aero/access'],
      'pro-only'
    );
    assert.equal(
      tools.get('refresh_cached_data').annotations.readOnlyHint,
      false
    );
    assert.deepEqual(
      tools.get('live_search').inputSchema.required.sort(),
      ['departureDate', 'destinationAirport', 'originAirport', 'source']
    );
  } finally {
    await client.close();
  }
});
