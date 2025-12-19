/**
 * K6 Load Test - Day 1 Launch Simulation
 * 
 * Simulates 400k users on launch day with:
 * - 160k DAU (40% of total users)
 * - 20k concurrent peak users (12.5% of DAU)
 * - Realistic user behavior patterns
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');
const requestsPerSecond = new Counter('requests_per_second');

// Configuration
export const options = {
  stages: [
    // Ramp up to simulate morning traffic (8 AM)
    { duration: '2m', target: 5000 },   // Early users
    { duration: '3m', target: 10000 },  // Morning ramp
    { duration: '5m', target: 20000 },  // Peak concurrent users
    
    // Maintain peak for lunch hours
    { duration: '10m', target: 20000 }, // Sustained peak
    
    // Afternoon dip
    { duration: '3m', target: 12000 },  // Post-lunch
    
    // Evening peak (5-7 PM)
    { duration: '5m', target: 20000 },  // Evening peak
    { duration: '10m', target: 20000 }, // Sustained evening
    
    // Wind down
    { duration: '5m', target: 5000 },   // Evening wind down
    { duration: '2m', target: 0 },      // Graceful shutdown
  ],
  
  thresholds: {
    // 95% of requests should complete within 1.5s
    http_req_duration: ['p(95)<1500'],
    // Error rate should be less than 5%
    errors: ['rate<0.05'],
    // 99% of requests should succeed
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

// User behaviors
const scenarios = {
  homeowner: 0.6,    // 60% homeowners
  contractor: 0.35,  // 35% contractors
  operator: 0.05,    // 5% operators
};

/**
 * Main test function - simulates realistic user journey
 */
export default function() {
  const userType = selectUserType();
  
  // Track request
  requestsPerSecond.add(1);
  
  switch(userType) {
    case 'homeowner':
      homeownerJourney();
      break;
    case 'contractor':
      contractorJourney();
      break;
    case 'operator':
      operatorJourney();
      break;
  }
  
  // Random think time (realistic user behavior)
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

/**
 * Select user type based on distribution
 */
function selectUserType() {
  const rand = Math.random();
  if (rand < scenarios.homeowner) return 'homeowner';
  if (rand < scenarios.homeowner + scenarios.contractor) return 'contractor';
  return 'operator';
}

/**
 * Homeowner user journey
 */
function homeownerJourney() {
  // 1. Load homepage
  const homeStart = Date.now();
  let res = http.get(`${BASE_URL}/`);
  pageLoadTime.add(Date.now() - homeStart);
  
  check(res, {
    'homepage loads': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(2);
  
  // 2. Browse jobs (40% of homeowners)
  if (Math.random() < 0.4) {
    const jobsStart = Date.now();
    res = http.get(`${BASE_URL}/browse-jobs`);
    apiResponseTime.add(Date.now() - jobsStart);
    
    check(res, {
      'browse jobs loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(3);
  }
  
  // 3. Post a job (10% of homeowners)
  if (Math.random() < 0.1) {
    res = http.get(`${BASE_URL}/post-job`);
    
    check(res, {
      'post job page loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(5); // Time to fill form
  }
}

/**
 * Contractor user journey
 */
function contractorJourney() {
  // 1. Load dashboard
  const dashStart = Date.now();
  let res = http.get(`${BASE_URL}/contractor-dashboard`);
  pageLoadTime.add(Date.now() - dashStart);
  
  check(res, {
    'contractor dashboard loads': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(2);
  
  // 2. Browse available jobs (80% of contractors)
  if (Math.random() < 0.8) {
    const jobsStart = Date.now();
    res = http.get(`${BASE_URL}/browse-jobs`);
    apiResponseTime.add(Date.now() - jobsStart);
    
    check(res, {
      'browse jobs loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(4);
  }
  
  // 3. View CRM (30% of contractors)
  if (Math.random() < 0.3) {
    res = http.get(`${BASE_URL}/crm`);
    
    check(res, {
      'CRM loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(3);
  }
  
  // 4. Check invoices (20% of contractors)
  if (Math.random() < 0.2) {
    res = http.get(`${BASE_URL}/invoices`);
    
    check(res, {
      'invoices page loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(2);
  }
}

/**
 * Operator user journey
 */
function operatorJourney() {
  // 1. Load operator dashboard
  const dashStart = Date.now();
  let res = http.get(`${BASE_URL}/operator-dashboard`);
  pageLoadTime.add(Date.now() - dashStart);
  
  check(res, {
    'operator dashboard loads': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(3);
  
  // 2. View territory metrics
  res = http.get(`${BASE_URL}/territories`);
  
  check(res, {
    'territories page loads': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(4);
}

/**
 * Setup - runs once per VU
 */
export function setup() {
  console.log('Starting Day 1 Launch Load Test');
  console.log(`Target: 20k concurrent users`);
  console.log(`Base URL: ${BASE_URL}`);
}

/**
 * Teardown - runs once after all VUs complete
 */
export function teardown(data) {
  console.log('Load test completed');
}
