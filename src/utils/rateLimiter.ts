interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private config: RateLimitConfig;
  private storageKey: string;

  constructor(key: string, config: RateLimitConfig) {
    this.storageKey = `rate_limit_${key}`;
    this.config = config;
  }

  private getData(): RateLimitData | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setData(data: RateLimitData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Storage failed, continue without persistence
    }
  }

  isBlocked(): boolean {
    const data = this.getData();
    if (!data) return false;

    const now = Date.now();

    // Check if still in block period
    if (data.blockedUntil && now < data.blockedUntil) {
      return true;
    }

    // Reset if window expired
    if (now - data.firstAttempt > this.config.windowMs) {
      this.reset();
      return false;
    }

    return data.attempts >= this.config.maxAttempts;
  }

  recordAttempt(): boolean {
    const now = Date.now();
    let data = this.getData();

    if (!data || now - data.firstAttempt > this.config.windowMs) {
      data = { attempts: 1, firstAttempt: now };
    } else {
      data.attempts++;
    }

    // Block if exceeded attempts
    if (data.attempts >= this.config.maxAttempts) {
      data.blockedUntil = now + this.config.blockDurationMs;
    }

    this.setData(data);
    return data.attempts < this.config.maxAttempts;
  }

  getRemainingTime(): number {
    const data = this.getData();
    if (!data?.blockedUntil) return 0;
    
    const remaining = data.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  reset(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Pre-configured rate limiters
export const otpRateLimiter = new RateLimiter('otp', {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
});

export const loginRateLimiter = new RateLimiter('login', {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
  blockDurationMs: 15 * 60 * 1000 // 15 minutes
});

export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};