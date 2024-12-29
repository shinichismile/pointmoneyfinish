import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  loginId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['worker', 'admin']),
  points: z.number(),
  avatarUrl: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  joinedAt: z.string(),
  totalEarned: z.number(),
  lastLogin: z.string().optional(),
  profile: z.object({
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    birthDate: z.string().optional(),
    bankInfo: z.object({
      bankName: z.string(),
      branchName: z.string(),
      accountType: z.enum(['普通', '当座']),
      accountNumber: z.string(),
      accountHolder: z.string(),
    }).optional(),
    cryptoAddress: z.string().optional(),
    payPayId: z.string().optional(),
  }).optional(),
});

// Point transaction schema
export const pointTransactionSchema = z.object({
  id: z.string(),
  workerId: z.string(),
  workerName: z.string(),
  adminId: z.string(),
  adminName: z.string(),
  amount: z.number(),
  type: z.enum(['add', 'subtract']),
  timestamp: z.string(),
  reason: z.string(),
});

// Withdrawal request schema
export const withdrawalRequestSchema = z.object({
  id: z.string(),
  workerId: z.string(),
  workerName: z.string(),
  amount: z.number(),
  paymentMethod: z.enum(['bank', 'crypto', 'paypay']),
  status: z.enum(['pending', 'processing', 'completed', 'rejected']),
  timestamp: z.string(),
  paymentDetails: z.object({
    bankInfo: z.object({
      bankName: z.string(),
      branchName: z.string(),
      accountType: z.string(),
      accountNumber: z.string(),
      accountHolder: z.string(),
    }).optional(),
    cryptoAddress: z.string().optional(),
    payPayId: z.string().optional(),
  }),
  adminComment: z.string().optional(),
  processedAt: z.string().optional(),
  processedBy: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type User = z.infer<typeof userSchema>;
export type PointTransaction = z.infer<typeof pointTransactionSchema>;
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;