import { z } from 'zod';

// WhatsApp number validation (10-15 digits, no spaces or special chars)
export const whatsappSchema = z
  .string()
  .regex(/^\d{10,15}$/, 'WhatsApp number must be 10-15 digits (country code + number, no spaces)')
  .or(z.literal(''));

// URL validation (only http/https protocols)
export const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    'Only http:// and https:// URLs are allowed'
  )
  .or(z.literal(''));

// Slug validation (lowercase letters, numbers, hyphens only)
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
  .max(100, 'Slug must be less than 100 characters');

// Email validation (proper format, length limits)
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase();

// Text field validation with length limits
export const textFieldSchema = (maxLength: number = 500) => 
  z.string().max(maxLength, `Must be less than ${maxLength} characters`);
