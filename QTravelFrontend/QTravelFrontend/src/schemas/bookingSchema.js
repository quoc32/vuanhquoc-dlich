import { z } from 'zod';

export const bookingSchema = z.object({
  passengers: z.array(
    z.object({
      title: z.enum(['mr', 'ms', 'mrs']),
      given_name: z.string().min(1, 'Given name is required'),
      family_name: z.string().min(1, 'Family name is required'),
      born_on: z.string().min(1, 'Date of birth is required'),
      email: z.string().email('Invalid email'),
      phone_number: z.string().min(10, 'Invalid phone number'),
      gender: z.enum(['m', 'f']),
    })
  ).min(1),
  payment_method: z.enum(['balance', 'momo_captureWallet', 'momo_payWithMethod', 'momo_payWithATM', 'momo_payWithCC']),
});
