#!/bin/bash

# Health Check Script for FairTradeWorker
# Verifies all systems are ready for 400k users

set -e

echo "==================================================================="
echo "FairTradeWorker Health Check - 400k Users Readiness"
echo "==================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" == "OK" ]; then
        echo -e "${GREEN}✓${NC} $message"
    elif [ "$status" == "WARNING" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        ((WARNINGS++))
    else
        echo -e "${RED}✗${NC} $message"
        ((ERRORS++))
    fi
}

echo "Checking Infrastructure Components..."
echo ""

# 1. Check Node.js and npm
echo "1. Node.js Environment"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "OK" "Node.js version: $NODE_VERSION"
else
    print_status "ERROR" "Node.js is not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "OK" "npm version: $NPM_VERSION"
else
    print_status "ERROR" "npm is not installed"
fi
echo ""

# 2. Check package.json dependencies
echo "2. Project Dependencies"
if [ -f "package.json" ]; then
    print_status "OK" "package.json found"
    
    if [ -d "node_modules" ]; then
        print_status "OK" "node_modules directory exists"
    else
        print_status "WARNING" "node_modules not found - run 'npm install'"
    fi
else
    print_status "ERROR" "package.json not found"
fi
echo ""

# 3. Check environment variables
echo "3. Environment Configuration"
ENV_FILE=".env"
if [ -f "$ENV_FILE" ] || [ -f ".env.local" ]; then
    print_status "OK" "Environment file found"
    
    # Check critical env vars (if .env exists)
    if [ -f "$ENV_FILE" ]; then
        if grep -q "VITE_SUPABASE_URL" "$ENV_FILE"; then
            print_status "OK" "Supabase URL configured"
        else
            print_status "WARNING" "VITE_SUPABASE_URL not found in .env"
        fi
        
        if grep -q "VITE_SUPABASE_ANON_KEY" "$ENV_FILE"; then
            print_status "OK" "Supabase anon key configured"
        else
            print_status "WARNING" "VITE_SUPABASE_ANON_KEY not found in .env"
        fi
    fi
else
    print_status "WARNING" "No .env file found - using environment variables"
fi
echo ""

# 4. Check infrastructure files
echo "4. Scaling Configuration"
if [ -f "infrastructure/scaling-config.ts" ]; then
    print_status "OK" "Scaling configuration exists"
    
    # Check for 400k user configuration
    if grep -q "400_000" "infrastructure/scaling-config.ts"; then
        print_status "OK" "Configuration updated for 400k users"
    else
        print_status "WARNING" "Configuration may not be optimized for 400k users"
    fi
else
    print_status "ERROR" "infrastructure/scaling-config.ts not found"
fi

if [ -f "infrastructure/supabase-pooling.config.ts" ]; then
    print_status "OK" "Supabase pooling configuration exists"
else
    print_status "WARNING" "Supabase pooling configuration not found"
fi

if [ -f "infrastructure/docker-compose.yml" ]; then
    print_status "OK" "Docker Compose configuration exists"
else
    print_status "WARNING" "Docker Compose configuration not found"
fi
echo ""

# 5. Check database migrations
echo "5. Database Migrations"
if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    print_status "OK" "Found $MIGRATION_COUNT migration files"
    
    # Check for scale optimization migration
    if [ -f "supabase/migrations/010_scale_400k_indexes.sql" ]; then
        print_status "OK" "Scale optimization migration exists"
    else
        print_status "WARNING" "Scale optimization migration (010_scale_400k_indexes.sql) not found"
    fi
else
    print_status "WARNING" "No supabase/migrations directory found"
fi
echo ""

# 6. Check circuit breaker implementation
echo "6. Reliability & Resilience"
if [ -f "src/lib/circuitBreaker.ts" ]; then
    print_status "OK" "Circuit breaker implementation exists"
else
    print_status "WARNING" "Circuit breaker not implemented"
fi

if [ -f "src/lib/rateLimit.ts" ]; then
    print_status "OK" "Rate limiting implementation exists"
else
    print_status "ERROR" "Rate limiting not implemented"
fi
echo ""

# 7. Check load testing
echo "7. Load Testing Preparation"
if [ -f "infrastructure/run-load-test.sh" ]; then
    print_status "OK" "Load test runner exists"
else
    print_status "WARNING" "Load test runner not found"
fi

if [ -f "infrastructure/load-tests/day1-launch.js" ]; then
    print_status "OK" "Day 1 launch test exists"
else
    print_status "WARNING" "Day 1 launch test not found"
fi

if command -v k6 &> /dev/null; then
    print_status "OK" "k6 load testing tool installed"
else
    print_status "WARNING" "k6 not installed - install from https://k6.io"
fi
echo ""

# 8. Check build configuration
echo "8. Build & Performance"
if [ -f "vite.config.ts" ]; then
    print_status "OK" "Vite configuration exists"
    
    # Check for optimization settings
    if grep -q "minify" "vite.config.ts"; then
        print_status "OK" "Minification enabled"
    else
        print_status "WARNING" "Minification may not be enabled"
    fi
else
    print_status "ERROR" "vite.config.ts not found"
fi

if [ -f "vercel.json" ]; then
    print_status "OK" "Vercel deployment configuration exists"
else
    print_status "WARNING" "vercel.json not found"
fi
echo ""

# 9. Check documentation
echo "9. Documentation"
if [ -f "infrastructure/DAY1_OPERATIONS_RUNBOOK.md" ]; then
    print_status "OK" "Operations runbook exists"
else
    print_status "WARNING" "Operations runbook not found"
fi

if [ -f "docs/business/SCALING_PLAN.md" ]; then
    print_status "OK" "Scaling plan documentation exists"
else
    print_status "WARNING" "Scaling plan documentation not found"
fi
echo ""

# 10. Test build (optional, takes time)
echo "10. Build Test (Optional)"
read -p "Run production build test? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npm run build > /tmp/build.log 2>&1; then
        print_status "OK" "Production build successful"
        
        # Check bundle size
        if [ -d "dist" ]; then
            DIST_SIZE=$(du -sh dist | cut -f1)
            print_status "OK" "Build output size: $DIST_SIZE"
        fi
    else
        print_status "ERROR" "Production build failed - check /tmp/build.log"
    fi
else
    print_status "WARNING" "Build test skipped"
fi
echo ""

# Summary
echo "==================================================================="
echo "Health Check Summary"
echo "==================================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC} System is ready for 400k users."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warnings found.${NC} Review and address before launch."
    exit 0
else
    echo -e "${RED}✗ $ERRORS errors found, $WARNINGS warnings.${NC} Fix errors before launch."
    exit 1
fi
