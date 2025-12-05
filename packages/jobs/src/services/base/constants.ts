/**
 * Shared constants for services
 * 
 * Note: For RESPONSE_STATUS, use the constants from @selectio/db/schema
 * as they define the actual database values.
 */

export const INTERVIEW = {
  /** Maximum number of interview questions */
  MAX_QUESTIONS: 4,
  /** Default fallback score (1-5 scale) */
  DEFAULT_FALLBACK_SCORE: 3,
  /** Default fallback detailed score (0-100 scale) */
  DEFAULT_FALLBACK_DETAILED_SCORE: 50,
  /** Default fallback question when AI parsing fails */
  DEFAULT_FALLBACK_QUESTION: "Расскажи подробнее о своем опыте",
} as const;

export const SCREENING = {
  /** Minimum score (0-100 scale) */
  MIN_SCORE: 0,
  /** Maximum score (0-100 scale) */
  MAX_SCORE: 100,
  /** Minimum simple score (1-5 scale) */
  MIN_SIMPLE_SCORE: 1,
  /** Maximum simple score (1-5 scale) */
  MAX_SIMPLE_SCORE: 5,
} as const;

export const AI = {
  /** Temperature for deterministic responses */
  TEMPERATURE_DETERMINISTIC: 0,
  /** Temperature for low creativity */
  TEMPERATURE_LOW: 0.1,
  /** Temperature for moderate creativity */
  TEMPERATURE_MODERATE: 0.3,
  /** Temperature for higher creativity (welcome messages, questions) */
  TEMPERATURE_CREATIVE: 0.7,
  /** Temperature for very creative responses */
  TEMPERATURE_HIGH: 0.8,
} as const;

export const TELEGRAM = {
  /** Minimum username length */
  MIN_USERNAME_LENGTH: 5,
  /** Username regex pattern */
  USERNAME_PATTERN: /^[a-zA-Z0-9_]{5,}$/,
} as const;

// Re-export RESPONSE_STATUS from database schema for consistency
export { RESPONSE_STATUS } from "@selectio/db/schema";
export type { ResponseStatus } from "@selectio/db/schema";
