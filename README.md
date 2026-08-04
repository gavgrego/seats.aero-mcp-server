[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

# seats.aero MCP server

## Not affiliated with seats.aero

A minimal TypeScript MCP server for searching award availability through the [Seats.aero partner API](https://developers.seats.aero/reference/getting-started-p).

You need a Seats.aero partner API key. Eligible Seats.aero Pro users can generate one from their Seats.aero settings; usage remains subject to the Seats.aero terms and API limits.

## Setup

```sh
pnpm install
pnpm build
pnpm start
```

Set `SEATS_API_KEY` in your MCP client configuration:

```json
{
  "mcpServers": {
    "seats": {
      "command": "node",
      "args": ["/absolute/path/to/seats-mcp/build/index.js"],
      "env": {
        "SEATS_API_KEY": "YOUR_SEATS_AERO_API_KEY"
      }
    }
  }
}
```

## Tools

| Tool | Seats.aero endpoint | Purpose |
| --- | --- | --- |
| `get_flights` | [Cached Search](https://developers.seats.aero/reference/cached-search) | Search cached availability across airports, dates, cabins, carriers, and mileage programs. |
| `get_bulk_avail` | [Bulk Availability](https://developers.seats.aero/reference/get-availability) | Retrieve many cached availability objects from one mileage program. |
| `get_routes` | [Get Routes](https://developers.seats.aero/reference/get-routes-1) | List routes tracked for one mileage program. |
| `get_trips` | [Get Trips](https://developers.seats.aero/reference/get-trips) | Retrieve flight-level details for an Availability object. |
| `live_search` | [Live Search](https://developers.seats.aero/reference/live-search) | Search a specific route and date live for one mileage program. |

Cached search accepts comma-delimited airport lists (`SFO,LAX`), cabin lists (`economy,business`), carrier lists (`DL,AA`), and source lists (`aeroplan,united`). Dates use `YYYY-MM-DD`.

Live searches can be slower and consume a partner API call. Prefer `get_flights` when cached availability is sufficient.

## Development

```sh
pnpm test
```

The tests build the server and exercise request construction with a mocked Seats.aero API.
