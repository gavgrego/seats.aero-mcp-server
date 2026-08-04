import { z } from 'zod';

export const CABIN_CLASSES = [
  'economy',
  'premium',
  'business',
  'first',
] as const;

export const SOURCES = [
  'eurobonus',
  'virginatlantic',
  'aeromexico',
  'american',
  'delta',
  'etihad',
  'united',
  'emirates',
  'aeroplan',
  'alaska',
  'velocity',
  'qantas',
  'connectmiles',
  'azul',
  'smiles',
  'flyingblue',
  'jetblue',
  'qatar',
  'turkish',
  'singapore',
  'ethiopian',
  'saudia',
  'finnair',
  'lufthansa',
  'frontier',
  'spirit',
] as const;

export const REGIONS = [
  'North America',
  'South America',
  'Africa',
  'Asia',
  'Europe',
  'Oceania',
] as const;

const date = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
    'Expected a date in YYYY-MM-DD format'
  );

const airportList = z
  .string()
  .regex(
    /^[A-Za-z]{3}(,[A-Za-z]{3})*$/,
    'Expected one or more comma-delimited three-letter airport codes'
  );

const airportCode = z
  .string()
  .regex(/^[A-Za-z]{3}$/, 'Expected a three-letter airport code');

const cabinList = z
  .string()
  .regex(
    /^(economy|premium|business|first)(,(economy|premium|business|first))*$/,
    'Expected one or more comma-delimited cabin names'
  );

const sourceList = z.string().refine(
  (value) =>
    value
      .split(',')
      .every((source) => (SOURCES as readonly string[]).includes(source)),
  'Expected one or more supported, comma-delimited mileage program sources'
);

export const GetFlightsSchema = z.object({
  originAirport: airportList.describe(
    'Origin airport codes, comma-delimited when searching multiple airports (for example, SFO,LAX).'
  ),
  destinationAirport: airportList.describe(
    'Destination airport codes, comma-delimited when searching multiple airports (for example, FRA,LHR).'
  ),
  startDate: date
    .optional()
    .describe('Earliest departure date, in YYYY-MM-DD format.'),
  endDate: date
    .optional()
    .describe('Latest departure date, in YYYY-MM-DD format.'),
  departureDate: date
    .optional()
    .describe(
      'Deprecated single-date alias. When startDate or endDate is omitted, this value is used for that bound.'
    ),
  cabins: cabinList
    .optional()
    .describe(
      'Cabins that must be available, comma-delimited when specifying multiple cabins.'
    ),
  cabinClass: z
    .enum(CABIN_CLASSES)
    .optional()
    .describe('Deprecated single-cabin alias for cabins.'),
  cursor: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Opaque cursor returned by the first page of this search.'),
  take: z
    .number()
    .int()
    .min(10)
    .max(1000)
    .optional()
    .describe('Maximum results to return (10-1000; default 500).'),
  order_by: z
    .literal('lowest_mileage')
    .optional()
    .describe('Set to lowest_mileage to return the cheapest results first.'),
  skip: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Number of already-retrieved results to skip.'),
  include_trips: z
    .boolean()
    .optional()
    .describe('Include flight-level trip details in each availability result.'),
  only_direct_flights: z
    .boolean()
    .optional()
    .describe('Only return results with a direct flight available.'),
  carriers: z
    .string()
    .regex(/^[A-Za-z0-9]{2}(,[A-Za-z0-9]{2})*$/)
    .optional()
    .describe('Two-character carrier codes, comma-delimited (for example, DL,AA).'),
  sources: sourceList
    .optional()
    .describe('Mileage program sources, comma-delimited when specifying multiple.'),
  include_filtered: z
    .boolean()
    .optional()
    .describe('Include raw results normally removed by dynamic-price filters.'),
  minify_trips: z
    .boolean()
    .optional()
    .describe('Return fewer trip fields when include_trips is enabled.'),
});

export const GetBulkAvailSchema = z.object({
  source: z.enum(SOURCES).describe('Mileage program source to retrieve.'),
  cabinClass: z
    .enum(CABIN_CLASSES)
    .optional()
    .describe('Only return results with this cabin available.'),
  startDate: date
    .optional()
    .describe('Earliest departure date, in YYYY-MM-DD format.'),
  endDate: date
    .optional()
    .describe('Latest departure date, in YYYY-MM-DD format.'),
  originRegion: z
    .enum(REGIONS)
    .optional()
    .describe('Only return results originating in this region.'),
  destinationRegion: z
    .enum(REGIONS)
    .optional()
    .describe('Only return results arriving in this region.'),
  take: z
    .number()
    .int()
    .min(10)
    .max(1000)
    .optional()
    .describe('Maximum results to return (10-1000; default 500).'),
  skip: z.number().int().nonnegative().optional(),
  cursor: z.number().int().nonnegative().optional(),
  include_filtered: z
    .boolean()
    .optional()
    .describe('Include raw results normally removed by dynamic-price filters.'),
});

export const GetRoutesSchema = z.object({
  source: z.enum(SOURCES).describe('Mileage program source to list routes for.'),
});

export const GetTripsSchema = z.object({
  id: z.string().min(1).describe('ID of an Availability object.'),
  include_filtered: z
    .boolean()
    .optional()
    .describe('Include dynamically-priced trips that are normally filtered out.'),
});

export const LiveSearchSchema = z.object({
  originAirport: airportCode.describe('Origin airport code.'),
  destinationAirport: airportCode.describe('Destination airport code.'),
  departureDate: date.describe('Departure date, in YYYY-MM-DD format.'),
  source: z.enum(SOURCES).describe('Mileage program source to search.'),
  disable_filters: z
    .boolean()
    .optional()
    .describe('Disable dynamic-pricing and mismatched-airport filters.'),
  show_dynamic_pricing: z
    .boolean()
    .optional()
    .describe('Include dynamic pricing while retaining mismatched-airport filters.'),
  seat_count: z
    .number()
    .int()
    .min(1)
    .max(9)
    .optional()
    .describe('Number of adult passengers to search for (1-9; default 1).'),
});

export type CabinClass = (typeof CABIN_CLASSES)[number];
export type Source = (typeof SOURCES)[number];
