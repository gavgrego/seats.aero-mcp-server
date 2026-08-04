import assert from 'node:assert/strict';
import test from 'node:test';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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
      'get_flights',
      'get_routes',
      'get_trips',
      'live_search',
    ]);
    assert.equal(
      tools.get('get_flights').inputSchema.properties.cabins.type,
      'string'
    );
    assert.deepEqual(
      tools.get('live_search').inputSchema.required.sort(),
      ['departureDate', 'destinationAirport', 'originAirport', 'source']
    );
  } finally {
    await client.close();
  }
});
