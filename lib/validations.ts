import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  phone: z.string().optional(),
  school: z.string().optional(),
  district: z.string().optional(),
  stream: z.string().optional(),
  medium: z.enum(['sinhala', 'tamil', 'english']).optional(),
  alYear: z.string().or(z.number()).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
})

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  type: z.string().min(2).max(100),
  message: z.string().min(10).max(2000),
})

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export const resourceRequestSchema = z.object({
  title: z.string().min(2).max(200),
  subject: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  medium: z.enum(['sinhala', 'tamil', 'english']),
  year: z.string().or(z.number()).optional(),
  notes: z.string().max(1000).optional(),
})

export const announcementSchema = z.object({
  message: z.string().min(1).max(500),
  type: z.enum(['info', 'warning', 'success', 'error']),
  isActive: z.boolean().optional(),
  link: z.string().url().optional().or(z.literal('')),
  linkText: z.string().max(50).optional(),
  dismissible: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
})

export const broadcastSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
  recipientType: z.enum(['all', 'verified', 'unverified']),
})

// Helper function to validate and return errors
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { success: false, error: firstError.message }
  }
  return { success: true, data: result.data }
}
