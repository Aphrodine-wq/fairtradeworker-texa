#!/bin/bash

# Load Testing Script for FairTradeWorker - 400k Users Simulation
# This script uses k6 (https://k6.io) for load testing

set -e

echo "==================================================================="
echo "FairTradeWorker Load Testing - 400k Users Day 1 Simulation"
echo "==================================================================="
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Installing..."
    echo "Visit https://k6.io/docs/getting-started/installation/ for installation instructions"
    echo ""
    echo "Quick install (macOS): brew install k6"
    echo "Quick install (Linux): sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69 && echo \"deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main\" | sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6"
    exit 1
fi

# Configuration
BASE_URL="${BASE_URL:-http://localhost:5173}"
DURATION="${DURATION:-5m}"
VUS="${VUS:-100}"

echo "Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Duration: $DURATION"
echo "  Virtual Users: $VUS"
echo ""

# Test scenarios
echo "Available test scenarios:"
echo "  1. Smoke Test (10 VUs, 2m) - Quick validation"
echo "  2. Load Test (100 VUs, 5m) - Normal load"
echo "  3. Stress Test (500 VUs, 10m) - High load"
echo "  4. Spike Test (1000 VUs, 3m) - Sudden traffic spike"
echo "  5. Day 1 Launch (2000 VUs, 15m) - Simulates 20k concurrent users"
echo "  6. Full Scale (5000 VUs, 30m) - Maximum capacity test"
echo ""

read -p "Select test scenario (1-6): " SCENARIO

case $SCENARIO in
    1)
        echo "Running Smoke Test..."
        k6 run --vus 10 --duration 2m ./infrastructure/load-tests/smoke-test.js
        ;;
    2)
        echo "Running Load Test..."
        k6 run --vus 100 --duration 5m ./infrastructure/load-tests/load-test.js
        ;;
    3)
        echo "Running Stress Test..."
        k6 run --vus 500 --duration 10m ./infrastructure/load-tests/stress-test.js
        ;;
    4)
        echo "Running Spike Test..."
        k6 run --vus 1000 --duration 3m ./infrastructure/load-tests/spike-test.js
        ;;
    5)
        echo "Running Day 1 Launch Simulation..."
        k6 run --vus 2000 --duration 15m ./infrastructure/load-tests/day1-launch.js
        ;;
    6)
        echo "Running Full Scale Test..."
        k6 run --vus 5000 --duration 30m ./infrastructure/load-tests/full-scale.js
        ;;
    *)
        echo "Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "==================================================================="
echo "Load test completed!"
echo "==================================================================="
