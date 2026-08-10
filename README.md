[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

# seats.aero MCP server

## Not affiliated with seats.aero

A minimal TypeScript MCP server for searching award availability through the [seats.aero partner API](https://developers.seats.aero/reference/getting-started-p).

You need a seats.aero Partner API key. Eligible seats.aero Pro users can generate one from their seats.aero settings; usage remains subject to the seats.aero terms and API limits.

### Endpoint access

Not every endpoint is available to every Partner API user:

- `live_search` **cannot be used with a seats.aero Pro API key**. It requires a
  commercial agreement with seats.aero.
- `refresh_cached_data` cannot currently be used by commercial users; the API
  documentation directs commercial users to `live_search` instead.

The server cannot determine the type of API key locally, so these restrictions
are advertised in its MCP instructions, tool descriptions, and tool metadata.

## Setup

Requires Node.js 20 or newer.

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

| Tool | seats.aero endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `get_flights` | [Cached Search](https://developers.seats.aero/reference/cached-search) | Partner API | Search cached availability across airports, dates, cabins, carriers, and mileage programs. |
| `get_bulk_avail` | [Bulk Availability](https://developers.seats.aero/reference/get-availability) | Partner API | Retrieve many cached availability objects from one mileage program. |
| `get_routes` | [Get Routes](https://developers.seats.aero/reference/get-routes-1) | Partner API | List routes tracked for one mileage program. |
| `get_destinations` | [Get Destinations](https://developers.seats.aero/reference/get-destinations) | Partner API | Find airports reachable nonstop from or to one airport and the cheapest raw price per cabin. |
| `get_trips` | [Get Trips](https://developers.seats.aero/reference/get-trips) | Partner API | Retrieve flight-level details for an Availability object. |
| `refresh_cached_data` | [Refresh Cached Data](https://developers.seats.aero/reference/refresh-cached-data) | Pro users; not commercial | Queue or poll refreshes for cached Availability objects. |
| `live_search` | [Live Search](https://developers.seats.aero/reference/live-search) | Commercial agreement only; not Pro | Search a specific route and date live for one mileage program. |

Cached search accepts comma-delimited airport lists (`SFO,LAX`), cabin lists (`economy,business`), carrier lists (`DL,AA`), and source lists (`aeroplan,united`). Dates use `YYYY-MM-DD`.

Live searches typically take 5-15 seconds. They can fail when an airline is
unavailable, so callers should limit retries and use exponential backoff. Prefer
`get_flights` when cached availability is sufficient.

This covers all seven active `Partner-Authorization` endpoints in the current
seats.aero API reference. OAuth consent, token, and user-info endpoints are not
exposed as tools because they are application authorization flows rather than
award-availability operations; this server authenticates with
`SEATS_API_KEY`.

## Development

```sh
pnpm test
```

The tests build the server and exercise request construction with a mocked seats.aero API.

## Releases

Releases follow [Semantic Versioning](https://semver.org/) and are managed on
GitHub by [Release Please](https://github.com/googleapis/release-please):

- `fix:` commits produce a patch release.
- `feat:` commits produce a minor release.
- commits with a `!` after the type or a `BREAKING CHANGE:` footer produce a
  major release.
- `docs:`, `test:`, `chore:`, and other non-user-facing commits do not trigger
  a release by themselves.

After release-worthy commits land on `main`, GitHub Actions creates or updates
a release PR containing the next version and changelog. Merging that PR creates
the corresponding `vX.Y.Z` Git tag and published GitHub Release. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the complete workflow.
