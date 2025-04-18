import { z } from 'zod';

const CABIN_CLASSES = ['economy', 'premium', 'business', 'first'] as const;
const ORDER_BY_OPTIONS = ['', 'lowest_mileage'] as const;
const SOURCES = [
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
] as const;

export const GetFlightsSchema = z.object({
  originAirport: z.string(),
  destinationAirport: z.string(),
  departureDate: z.string().optional(),
  cabinClass: z.enum(CABIN_CLASSES).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  cursor: z.number().optional(),
  take: z.number().min(10).max(1000).optional(),
  order_by: z.enum(ORDER_BY_OPTIONS).optional(),
  skip: z.number().optional(),
  include_trips: z.boolean().optional(),
  only_direct_flights: z.boolean().optional(),
  carriers: z.string().min(2).max(2).optional(),
});

export const GetBulkAvailSchema = z.object({
  source: z.enum(SOURCES),
  cabinClass: z.enum(CABIN_CLASSES).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  originRegion: z.string().optional(),
  destinationRegion: z.string().optional(),
  take: z.number().min(10).max(1000).optional(),
  skip: z.number().optional(),
  cursor: z.number().optional(),
});

export const GetRoutesSchema = z.object({
  source: z.enum(SOURCES),
});

export type CabinClass = (typeof CABIN_CLASSES)[number];
export type OrderByOption = (typeof ORDER_BY_OPTIONS)[number];
export type Source = (typeof SOURCES)[number];
