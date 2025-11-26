// lib/validation.ts - Input validation and sanitization

import { parseEther } from 'viem'
import { CreateMarketFormData, ValidationError, FormValidation } from './types'

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateMarketQuestion(question: string): ValidationError | null {
  if (!question || question.trim().length === 0) {
    return { field: 'question', message: 'Question is required' }
  }

  if (question.length < 10) {
    return { field: 'question', message: 'Question must be at least 10 characters' }
  }

  if (question.length > 500) {
    return { field: 'question', message: 'Question must be less than 500 characters' }
  }

  // Check for malicious content
  const dangerousPatterns = [/<script/i, /javascript:/i, /onerror=/i]
  if (dangerousPatterns.some(pattern => pattern.test(question))) {
    return { field: 'question', message: 'Question contains invalid characters' }
  }

  return null
}

export function validateTargetPrice(price: string): ValidationError | null {
  if (!price || price.trim().length === 0) {
    return { field: 'targetPrice', message: 'Target price is required' }
  }

  const numPrice = parseFloat(price)

  if (isNaN(numPrice)) {
    return { field: 'targetPrice', message: 'Target price must be a valid number' }
  }

  if (numPrice <= 0) {
    return { field: 'targetPrice', message: 'Target price must be greater than 0' }
  }

  if (numPrice > 1000000000) {
    return { field: 'targetPrice', message: 'Target price is too large' }
  }

  // Check for too many decimal places
  const decimalPlaces = (price.split('.')[1] || '').length
  if (decimalPlaces > 18) {
    return { field: 'targetPrice', message: 'Too many decimal places' }
  }

  return null
}

export function validateResolutionTime(resolutionTime: string): ValidationError | null {
  if (!resolutionTime || resolutionTime.trim().length === 0) {
    return { field: 'resolutionTime', message: 'Resolution time is required' }
  }

  const timestamp = new Date(resolutionTime).getTime()
  const now = Date.now()

  if (isNaN(timestamp)) {
    return { field: 'resolutionTime', message: 'Invalid resolution time' }
  }

  const MIN_DURATION = 3600 * 1000 // 1 hour in milliseconds
  const MAX_DURATION = 365 * 24 * 3600 * 1000 // 1 year in milliseconds

  if (timestamp <= now) {
    return { field: 'resolutionTime', message: 'Resolution time must be in the future' }
  }

  if (timestamp - now < MIN_DURATION) {
    return { field: 'resolutionTime', message: 'Resolution time must be at least 1 hour from now' }
  }

  if (timestamp - now > MAX_DURATION) {
    return { field: 'resolutionTime', message: 'Resolution time cannot be more than 1 year from now' }
  }

  return null
}

export function validateAsset(asset: string): ValidationError | null {
  const validAssets = ['BTC', 'ETH', 'BNB']

  if (!validAssets.includes(asset)) {
    return { field: 'asset', message: 'Invalid asset selected' }
  }

  return null
}

export function validateTradeAmount(amount: string): ValidationError | null {
  if (!amount || amount.trim().length === 0) {
    return { field: 'amount', message: 'Trade amount is required' }
  }

  const numAmount = parseFloat(amount)

  if (isNaN(numAmount)) {
    return { field: 'amount', message: 'Trade amount must be a valid number' }
  }

  if (numAmount < 0.01) {
    return { field: 'amount', message: 'Minimum trade amount is 0.01 BNB' }
  }

  if (numAmount > 1000) {
    return { field: 'amount', message: 'Maximum trade amount is 1000 BNB' }
  }

  return null
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

export function validateCreateMarketForm(data: CreateMarketFormData): FormValidation {
  const errors: ValidationError[] = []

  const questionError = validateMarketQuestion(data.question)
  if (questionError) errors.push(questionError)

  const assetError = validateAsset(data.asset)
  if (assetError) errors.push(assetError)

  const priceError = validateTargetPrice(data.targetPrice)
  if (priceError) errors.push(priceError)

  const timeError = validateResolutionTime(data.resolutionTime)
  if (timeError) errors.push(timeError)

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeNumber(input: string): string {
  return input.replace(/[^0-9.]/g, '')
}

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

export function safeParseEther(value: string): bigint {
  try {
    const sanitized = sanitizeNumber(value)
    return parseEther(sanitized)
  } catch (error) {
    throw new Error(`Invalid ether value: ${value}`)
  }
}

export function safeTimestamp(dateString: string): bigint {
  try {
    const timestamp = new Date(dateString).getTime()
    if (isNaN(timestamp)) {
      throw new Error('Invalid date')
    }
    return BigInt(Math.floor(timestamp / 1000))
  } catch (error) {
    throw new Error(`Invalid timestamp: ${dateString}`)
  }
}

// ============================================================================
// ERROR MESSAGE HELPERS
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle common Web3 errors
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected'
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction'
    }
    if (error.message.includes('gas')) {
      return 'Gas estimation failed. Please try again.'
    }
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unknown error occurred'
}

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs)
    
    if (validAttempts.length >= maxAttempts) {
      return false
    }
    
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

export const rateLimiter = new RateLimiter()

// ============================================================================
// DEBOUNCE HELPER
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}