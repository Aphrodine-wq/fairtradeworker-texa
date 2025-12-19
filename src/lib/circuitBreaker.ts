/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by failing fast when services are down.
 * Essential for handling 400k users where external service failures
 * could cause system-wide issues.
 */

import { SCALING_CONFIG } from '../../infrastructure/scaling-config';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

interface CircuitBreakerStats {
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  state: CircuitState;
}

/**
 * Circuit Breaker for protecting against cascading failures
 */
export class CircuitBreaker {
  private stats: CircuitBreakerStats;
  private config: CircuitBreakerConfig;
  private nextAttemptTime: number = 0;

  constructor(
    private name: string,
    config?: Partial<CircuitBreakerConfig>
  ) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? SCALING_CONFIG.CIRCUIT_BREAKER.FAILURE_THRESHOLD,
      successThreshold: config?.successThreshold ?? SCALING_CONFIG.CIRCUIT_BREAKER.SUCCESS_THRESHOLD,
      timeout: config?.timeout ?? SCALING_CONFIG.CIRCUIT_BREAKER.TIMEOUT_MS,
      resetTimeout: config?.resetTimeout ?? SCALING_CONFIG.CIRCUIT_BREAKER.RESET_TIMEOUT_MS,
    };

    this.stats = {
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      state: CircuitState.CLOSED,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    // Check if circuit is OPEN
    if (this.stats.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        console.warn(`[CircuitBreaker:${this.name}] Circuit is OPEN, failing fast`);
        
        if (fallback) {
          return await fallback();
        }
        
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      
      // Try transitioning to HALF_OPEN
      this.stats.state = CircuitState.HALF_OPEN;
      console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);
      
      // Record success
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Record failure
      this.onFailure();
      
      // Use fallback if available
      if (fallback) {
        console.warn(`[CircuitBreaker:${this.name}] Using fallback`, error);
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeout)
      ),
    ]);
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.stats.successes++;
    
    if (this.stats.state === CircuitState.HALF_OPEN) {
      if (this.stats.successes >= this.config.successThreshold) {
        console.log(`[CircuitBreaker:${this.name}] Transitioning to CLOSED`);
        this.stats.state = CircuitState.CLOSED;
        this.stats.failures = 0;
        this.stats.successes = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.stats.failures++;
    this.stats.lastFailureTime = Date.now();
    
    if (this.stats.state === CircuitState.HALF_OPEN) {
      // Failed during test, go back to OPEN
      console.warn(`[CircuitBreaker:${this.name}] Transitioning to OPEN`);
      this.stats.state = CircuitState.OPEN;
      this.stats.successes = 0;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    } else if (this.stats.failures >= this.config.failureThreshold) {
      // Too many failures, open the circuit
      console.warn(`[CircuitBreaker:${this.name}] Failure threshold reached, transitioning to OPEN`);
      this.stats.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.stats.state;
  }

  /**
   * Get circuit stats
   */
  getStats(): Readonly<CircuitBreakerStats> {
    return { ...this.stats };
  }

  /**
   * Manually reset the circuit
   */
  reset(): void {
    this.stats = {
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      state: CircuitState.CLOSED,
    };
    this.nextAttemptTime = 0;
    console.log(`[CircuitBreaker:${this.name}] Manually reset`);
  }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    this.breakers.forEach((breaker, name) => {
      states[name] = breaker.getState();
    });
    return states;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }
}

// Global registry
export const circuitBreakers = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for common services
 */
export const serviceCircuitBreakers = {
  // Supabase database
  database: circuitBreakers.get('database', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 10000,
    resetTimeout: 30000,
  }),

  // OpenAI API
  openai: circuitBreakers.get('openai', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    resetTimeout: 60000,
  }),

  // Stripe API
  stripe: circuitBreakers.get('stripe', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 15000,
    resetTimeout: 30000,
  }),

  // Twilio SMS
  twilio: circuitBreakers.get('twilio', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 10000,
    resetTimeout: 30000,
  }),

  // SendGrid Email
  sendgrid: circuitBreakers.get('sendgrid', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 10000,
    resetTimeout: 30000,
  }),

  // File storage (S3/R2)
  storage: circuitBreakers.get('storage', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 15000,
    resetTimeout: 30000,
  }),
};

/**
 * Utility: Execute with circuit breaker and fallback
 */
export async function withCircuitBreaker<T>(
  serviceName: keyof typeof serviceCircuitBreakers,
  fn: () => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> {
  const breaker = serviceCircuitBreakers[serviceName];
  return breaker.execute(fn, fallback);
}
