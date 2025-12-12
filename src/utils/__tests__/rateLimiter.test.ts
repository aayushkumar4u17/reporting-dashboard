import { describe, it, expect, beforeEach, vi } from 'vitest'
import { otpRateLimiter, loginRateLimiter, formatTime } from '../rateLimiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('otpRateLimiter', () => {
    it('should allow initial attempts', () => {
      expect(otpRateLimiter.isBlocked()).toBe(false)
      expect(otpRateLimiter.recordAttempt()).toBe(true)
    })

    it('should block after max attempts', () => {
      // Make 3 attempts (max allowed)
      otpRateLimiter.recordAttempt()
      otpRateLimiter.recordAttempt()
      expect(otpRateLimiter.recordAttempt()).toBe(false)
      expect(otpRateLimiter.isBlocked()).toBe(true)
    })

    it('should reset after window expires', () => {
      // Mock time progression
      const originalNow = Date.now
      let mockTime = Date.now()
      Date.now = vi.fn(() => mockTime)

      otpRateLimiter.recordAttempt()
      otpRateLimiter.recordAttempt()
      otpRateLimiter.recordAttempt()
      expect(otpRateLimiter.isBlocked()).toBe(true)

      // Advance time beyond window
      mockTime += 16 * 60 * 1000 // 16 minutes
      expect(otpRateLimiter.isBlocked()).toBe(false)

      Date.now = originalNow
    })
  })

  describe('formatTime', () => {
    it('should format milliseconds correctly', () => {
      expect(formatTime(90000)).toBe('1:30')
      expect(formatTime(5000)).toBe('0:05')
      expect(formatTime(0)).toBe('0:00')
    })
  })
})