[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

# seats.aero MCP server

## Not affiliated with seats.aero

A TypeScript-based, minimal MCP server for interacting with the seats.aero API via Claude desktop or any other MCP clients in natural language.

❗ You will need a seats.aero API key via a seats.aero Pro membership in order to use this tool

### Setup

Install dependencies
`pnpm i`

Build and compile TypeScript
`pnpm build`

Start MCP server
`pnpm start`

### Config

You will need to add your MCP server config to your `claude_desktop_config.json` file or whatever your MCP client of choice is.

```json
"seats": {
  "command": "node",
  "args": ["/Users/USER/Sites/seats-mcp/build/index.js"],
  "env": {
    "SEATS_API_KEY": "SEATS_API_KEY"
  }
}
```

### Tools available

`get_flights`
Get a list of flights. Your MCP client will be able to search via the same parameters as the [cached search endpoint](https://developers.seats.aero/reference/cached-search)

`get_bulk_avail`
Retrieve a large amount of availability objects from one specific mileage program (source). Your MCP client will be able to search via the same parameters as the [bulk availability endpoint](https://developers.seats.aero/reference/get-availability)

`get_routes`
Retrieve a list of route objects from one specific mileage program (source). Your MCP client will be able to search via the same parameters as the [routes endpoint](https://developers.seats.aero/reference/get-routes-1).
