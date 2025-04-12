import { z } from 'zod';

export const GetFlightsSchema = z.object({
  originAirport: z.string(),
  destinationAirport: z.string(),
  departureDate: z.string().optional(),
  cabinClass: z.enum(['economy', 'premium', 'business', 'first']).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    .optional(),
  cursor: z.number().optional(),
  take: z.number().optional(),
  order_by: z.enum(['price', 'duration']).optional(),
  skip: z.number().optional(),
  include_trips: z.boolean().optional(),
  only_direct_flights: z.boolean().optional(),
  carriers: z.string().min(2).max(2).optional(),
});
