# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-03

### Added

- Added `get_trips` for retrieving flight-level details from a cached
  Availability object.
- Added `live_search` for running an exact-route, exact-date search against a
  mileage program.
- Added support for the Finnair Plus, Lufthansa Miles & More, Frontier, and
  Spirit mileage-program sources.
- Added `include_filtered` support to bulk availability searches.
- Added comma-delimited multi-airport and multi-cabin cached searches.
- Added a shared Seats.aero API client for authentication, query construction,
  JSON requests, and consistent MCP error responses.
- Added request-construction tests and an end-to-end MCP stdio handshake test
  covering all five tools and their advertised JSON schemas.
- Added a tracked `pnpm-lock.yaml` for reproducible dependency installation.

### Changed

- Migrated from `@modelcontextprotocol/sdk` v1 to the split MCP TypeScript SDK
  v2 packages: `@modelcontextprotocol/server` and
  `@modelcontextprotocol/client`.
- Upgraded Zod from v3 to v4 and registered complete Standard Schema objects
  with `registerTool`.
- Switched stdio startup to the v2 `serveStdio` server factory.
- Marked Seats.aero tools as read-only, idempotent, and open-world operations.
- Updated cached-search and bulk-availability defaults to the documented 500
  results.
- Updated schemas with stricter date, airport, cabin, region, source,
  pagination, and seat-count validation.
- Preserved `departureDate` and `cabinClass` as deprecated compatibility aliases
  for the documented date-range and `cabins` parameters.
- Updated the README, package metadata, and Docker build for Node.js 20+, MCP
  SDK v2, and frozen pnpm installs.

### Fixed

- Fixed cached-search cursors being accepted by the schema but omitted from API
  requests.
- Fixed the invalid default `order_by=price`; the parameter is now omitted for
  default ordering and only sends the documented `lowest_mileage` value.
- Fixed single-date searches to use documented `start_date` and `end_date`
  parameters rather than the undocumented `departure_date` query parameter.
- Fixed inconsistent Seats.aero authentication, HTTP error handling, and
  response formatting across tools.
- Fixed the Docker build referencing an unavailable lockfile while still using
  non-reproducible dependency installation.

### Removed

- Removed the obsolete Smithery configuration.
