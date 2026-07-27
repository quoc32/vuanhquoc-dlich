import { z } from 'zod';

export const searchFlightSchema = z.object({
  trip_type: z.enum(['one-way', 'round-trip']).default('one-way'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departure_date: z.string().min(1, 'Date is required'),
  return_date: z.string().optional().or(z.literal('')),
  passengers: z.number().min(1).max(9),
  cabin_class: z.enum(['economy', 'premium_economy', 'business', 'first']),
}).refine(data => {
  if (data.trip_type === 'round-trip' && !data.return_date) {
    return false;
  }
  return true;
}, {
  message: "Return date is required",
  path: ["return_date"]
});
