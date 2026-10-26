import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone_number: z.string().regex(/^01\d{7,9}$/, 'Enter a valid Malaysian number, e.g. 0123456789'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const transferSchema = (balance: number = Infinity) => z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  token: z.string().min(1, 'Token is required'),
  amount: z.string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount')
    .refine((v) => Number(v) <= balance, 'Insufficient balance'),
});

export const depositSchema = z.object({
  amount_myr: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 10, 'Minimum deposit is RM 10'),
});

export const withdrawSchema = (balance: number = Infinity) => z.object({
  destination_type: z.enum(['bank', 'sui_wallet']),
  amount: z.string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount')
    .refine((v) => Number(v) <= balance, 'Insufficient balance'),
  token: z.string().min(1, 'Token is required'),
  bank_account: z.string().optional(),
  bank_name: z.string().optional(),
  sui_address: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TransferFormData = z.infer<ReturnType<typeof transferSchema>>;
export type DepositFormData = z.infer<typeof depositSchema>;
export type WithdrawFormData = z.infer<ReturnType<typeof withdrawSchema>>;
