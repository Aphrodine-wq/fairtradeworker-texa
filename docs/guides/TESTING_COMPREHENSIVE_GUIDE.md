# Comprehensive Testing Guide

## Overview

This document provides a comprehensive guide to the testing infrastructure, test suites, and testing best practices for the FairTradeWorker platform.

## Test Architecture

### Test Categories

The test suite is organized into four main categories:

1. **Unit Tests** (`src/tests/unit/`) - Test individual components and utilities in isolation
2. **Integration Tests** (`src/tests/integration/`) - Test interactions between multiple components
3. **E2E Tests** (`src/tests/e2e/`) - Test complete user workflows end-to-end
4. **Audit Tests** (`src/tests/audit/`) - Test platform compliance and security

### Test Statistics

- **Total Test Files**: 18+
- **Total Test Suites**: 60+
- **Total Test Cases**: 200+
- **Code Coverage**: ~85% (target: 90%+)

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test src/tests/unit/components/ThemeToggle.test.tsx

# Run tests matching a pattern
npm run test -- --grep "navigation"
```

### Test Configuration

Tests are configured in `vitest.config.ts`:
- **Environment**: jsdom (for DOM testing)
- **Framework**: Vitest with React Testing Library
- **Mocking**: Spark KV store for data persistence
- **Coverage**: Istanbul for code coverage reports

## Test Suites by Category

### Unit Tests

#### Component Tests

**ThemeToggle.test.tsx**
- Tests theme switching functionality
- Validates 5-second transition synchronization
- Verifies localStorage persistence
- Tests accessibility attributes
- Validates meta tag updates (theme-color, Apple status bar)

**NavigationCustomizer.test.tsx**
- Tests navigation item customization
- Validates business tool addition
- Tests drag-and-drop reordering
- Verifies visibility toggling
- Tests save/reset functionality
- Validates role-based tool availability

**Button.test.tsx**
- Tests button variants and sizes
- Validates accessibility attributes
- Tests click handlers and disabled states
- Verifies proper ARIA labels

**Card.test.tsx**
- Tests card component rendering
- Validates glass morphism styling
- Tests hover and interaction states

**Input.test.tsx**
- Tests input field functionality
- Validates form validation
- Tests accessibility attributes

**LiveStatsBar.test.tsx**
- Tests live stats display
- Validates real-time updates
- Tests animation and transitions

#### Library Tests

**sorting.test.ts**
- Tests bid sorting algorithms
- Validates performance-based sorting
- Tests multi-criteria sorting

**viral.test.ts**
- Tests viral feature calculations
- Validates referral code generation
- Tests FRESH job indicators
- Validates Lightning Bid mechanics

**zeroCostFeatures.test.ts**
- Tests free feature availability
- Validates feature access control
- Tests feature functionality

### Integration Tests

**paymentProcessing.test.tsx** (19 tests)
- Payment method management
- Milestone payment processing
- Change order payments
- Contractor payout calculations
- Payment security validation
- Stripe integration
- Fee calculations
- Payment status tracking

**aiReceptionist.test.ts**
- AI receptionist functionality
- Lead capture and processing
- CRM synchronization
- Phone call handling

### E2E Tests

**authentication.test.tsx** (20+ tests)
- User signup for all roles (homeowner, contractor, operator)
- Login with preserved user stats
- Demo mode activation and switching
- Session persistence
- Logout functionality
- Role-based navigation

**homeownerWorkflow.test.tsx** (20+ tests)
- Job posting (Quick Fix, Standard, Major Project)
- Referral code generation and usage
- Bid review and selection
- Milestone payments
- Change order approval
- Project completion
- Payment processing

**contractorWorkflow.test.tsx** (35+ tests)
- Dashboard navigation and metrics
- Job browsing and filtering
- Bidding on all job types
- Lightning Bids (<15 min response)
- CRM customer management
- Invoice creation and tracking
- Contractor referral system
- Pro upgrade flow
- Instant payouts
- Route optimization

**operatorWorkflow.test.tsx** (15+ tests)
- Territory claiming and management
- Speed metrics dashboard (traffic light indicators)
- Job-to-bid time tracking
- Territory analytics
- Conversion tracking
- Same-day payout tracking
- Contractor network management

**majorProject.test.tsx** (15+ tests)
- Major project posting ($5K+)
- Milestone structure and dependencies
- Multi-trade coordination
- Progress tracking with photos
- Expense tracking
- Milestone disputes
- Change order management

**viralFeatures.test.tsx** (25+ tests)
- Post-&-Win referral system
- FRESH job indicators (<1 hour)
- Lightning Bid mechanics (<15 min)
- Live stats bar updates
- Contractor invite leaderboard
- Performance-first bid sorting
- Push notifications
- Referral earnings tracking

**integrationWorkflows.test.tsx** (10+ tests)
- Complete job lifecycle (posting → payment)
- Multi-level referral chains
- Contractor network growth
- Territory revenue flow
- Multi-trade project coordination
- Data consistency validation

### Audit Tests

**platformAudit.test.tsx**
- Security compliance checks
- Performance benchmarks
- Accessibility audits
- Data privacy validation

## Test Data Management

### Test Fixtures

Test data is centralized in `src/tests/helpers/testData.ts`:

```typescript
// Example test data structure
export const mockHomeowner: User = {
  id: 'h-1',
  email: 'homeowner@test.com',
  fullName: 'Test Homeowner',
  role: 'homeowner',
  // ... complete user object
}

export const mockContractor: User = {
  id: 'c-1',
  email: 'contractor@test.com',
  fullName: 'Test Contractor',
  role: 'contractor',
  // ... complete contractor object
}

export const mockJob: Job = {
  id: 'job-1',
  title: 'Test Job',
  // ... complete job object
}
```

### Helper Functions

**Referral Code Generation**
- `generateReferralCode(name: string, userId: string): string`
- Generates unique referral codes for testing

**Tax Calculations**
- `calculateTax(amount: number, state: string): number`
- `calculateTotal(amount: number, state: string): number`

**Date Utilities**
- `createDate(daysAgo: number): string`
- `formatDate(date: string): string`

## Testing Best Practices

### Writing Tests

1. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
   ```typescript
   // Good
   it('should toggle between light and dark themes on click and persist to localStorage', () => {
   
   // Bad
   it('should work', () => {
   ```

2. **Arrange-Act-Assert Pattern**: Structure tests clearly
   ```typescript
   it('should save navigation preferences', async () => {
     // Arrange: Set up test data
     const items = [...mockNavItems]
     
     // Act: Perform the action
     fireEvent.click(saveButton)
     
     // Assert: Verify the result
     await waitFor(() => {
       expect(mockOnSave).toHaveBeenCalled()
     })
   })
   ```

3. **Test Isolation**: Each test should be independent
   ```typescript
   beforeEach(() => {
     // Clear state before each test
     localStorage.clear()
     vi.clearAllMocks()
   })
   ```

4. **Use WaitFor for Async Operations**: Always use `waitFor` for async state changes
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument()
   })
   ```

5. **Test Edge Cases**: Include tests for error conditions and edge cases
   - Empty data
   - Invalid input
   - Network errors
   - Missing data

### Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Accessibility Testing

All component tests should verify:
- ARIA labels are present
- Keyboard navigation works
- Screen reader compatibility
- Focus management
- Minimum touch target sizes (44px)

### Performance Testing

Key metrics to test:
- Component render time
- State update performance
- Large list rendering
- Image loading optimization
- Bundle size limits

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

CI pipeline:
1. Lint code
2. Type check (TypeScript)
3. Run all tests
4. Generate coverage report
5. Deploy if all checks pass

## Debugging Tests

### Common Issues

1. **Async Timing**: Use `waitFor` instead of `setTimeout`
2. **Mock Not Reset**: Always clear mocks in `beforeEach`
3. **State Not Updated**: Check if component re-renders after state changes
4. **Event Not Firing**: Verify element is visible and enabled

### Debugging Commands

```bash
# Run tests with verbose output
npm run test -- --verbose

# Run single test in debug mode
npm run test -- --inspect-brk src/tests/unit/components/ThemeToggle.test.tsx

# Run tests and keep browser open
npm run test:ui -- --no-headless
```

## Future Enhancements

### Planned Test Additions

1. **Visual Regression Tests**
   - Screenshot comparison
   - UI consistency checks

2. **Performance Benchmarks**
   - Load time measurements
   - Bundle size tracking
   - Runtime performance

3. **Mobile Responsiveness Tests**
   - Viewport testing
   - Touch interaction testing
   - Mobile browser compatibility

4. **API Integration Tests**
   - External API mocking
   - Error handling
   - Rate limiting

5. **Accessibility Automated Testing**
   - axe-core integration
   - WCAG compliance checks
   - Screen reader testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing Guide](https://www.w3.org/WAI/test-evaluate/)
