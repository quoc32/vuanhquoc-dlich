import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email is invalid').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Email is invalid').min(1, 'Email is required'),
  phone: z.string().min(10, 'Phone number is invalid').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
