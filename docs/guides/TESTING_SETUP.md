# End-to-End Testing Setup

## Overview
Comprehensive E2E testing framework for FairTradeWorker major project workflows.

## Test Structure

### `/src/tests/`
- `setup.ts` - Global test configuration and mocks
- `helpers/testData.ts` - Reusable test data fixtures
- `e2e/` - End-to-end test suites

## Test Suites

### Major Project Workflow (`majorProject.test.tsx`)
Tests the complete lifecycle of major projects ($5K-$50K):
- Job posting with scope builder
- Milestone payment setup
- Contractor bidding with itemized quotes
- Progress tracking across milestones
- Multi-trade coordination
- Change order management

### Contractor Workflow (`contractorWorkflow.test.tsx`)
Tests contractor experience:
- Dashboard navigation and metrics
- Job browsing and bidding
- CRM customer management
- Invoice creation and tracking
- Route optimization

## Running Tests

```bash
npm run test
```

## Mock Data
All test fixtures available in `helpers/testData.ts`:
- Mock users (homeowner, contractor, operator)
- Sample jobs (quick fix, standard, major project)
- Milestones, bids, invoices
- Territory data

## Future Enhancements
- Visual regression testing
- Performance benchmarks
- API integration tests
- Mobile responsiveness tests
