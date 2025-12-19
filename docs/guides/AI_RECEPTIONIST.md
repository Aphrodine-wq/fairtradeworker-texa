# AI Receptionist Setup Guide

## Overview

The AI Receptionist is a **mission-critical** feature that provides 24/7 phone answering for contractors and subcontractors. It automatically transcribes calls, extracts structured information, creates private jobs in the CRM, and onboards callers.

**Critical Requirement**: This system must work 100% of the time. If it breaks, we break.

## Architecture

### Flow

1. Customer calls contractor's Twilio number
2. Twilio records call and sends webhook to `/api/receptionist/inbound`
3. Call is transcribed using OpenAI Whisper
4. GPT-4o extracts structured data (name, issue, urgency, address)
5. Private job is created in contractor's CRM
6. SMS sent to caller with onboarding link
7. Contractor receives notification of new lead

### Reliability Features

- **3x retry logic** on all external API calls
- **Exponential backoff** for transient failures
- **Fallback mechanisms** at every step
- **Multiple confidence thresholds** for job creation
- **Comprehensive error logging** to monitoring service
- **Critical alerts** for system failures
- **Graceful degradation** when services unavailable

## Setup Instructions

### 1. Twilio Configuration

Each contractor/subcontractor gets their own Twilio phone number.

#### Purchase Number

```bash
# Using Twilio CLI
twilio phone-numbers:buy:local --country-code US --sms-enabled --voice-enabled
```

#### Configure Webhook

In Twilio Console:

- Navigate to Phone Numbers → Active Numbers
- Select the contractor's number
- Under Voice & Fax:
  - A Call Comes In: Webhook
  - URL: `https://yourdomain.com/api/receptionist/inbound`
  - HTTP Method: POST
  - Primary Handler Fails: Use TwiML bins (see fallback below)

#### Recording Configuration

- Call Recording: Enable
- Recording Status Callback: `https://yourdomain.com/api/receptionist/recording-status`
- Transcription: Enable
- Transcription Callback: `https://yourdomain.com/api/receptionist/transcription`

### 2. Environment Variables

Add to Vercel/hosting environment:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database Configuration (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Contractor Phone Mapping (temporary - should move to DB)
CONTRACTOR_PHONES='{"1234567890":"contractor-id-1","0987654321":"contractor-id-2"}'

# Monitoring (optional but recommended)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
DATADOG_API_KEY=xxxxx
```

### 3. Database Schema

Create tables in Supabase:

```sql
-- Contractors table (if not exists)
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  receptionist_phone TEXT UNIQUE,
  specialties TEXT[],
  service_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (enhanced for receptionist)
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  contractor_id UUID REFERENCES contractors(id),
  type TEXT CHECK (type IN ('public', 'private')),
  is_private BOOLEAN DEFAULT false,
  source TEXT CHECK (source IN ('marketplace', 'ai_receptionist', 'manual')),
  status TEXT CHECK (status IN ('new', 'open', 'in_progress', 'completed', 'voicemail', 'missed')),
  title TEXT NOT NULL,
  description TEXT,
  homeowner_phone TEXT,
  homeowner_name TEXT,
  address TEXT,
  zip_code TEXT,
  issue_type TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  estimated_scope TEXT,
  call_sid TEXT,
  transcript TEXT,
  recording_url TEXT,
  confidence DECIMAL(3,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_homeowner_phone ON jobs(homeowner_phone);

-- Call logs table for debugging
CREATE TABLE receptionist_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_sid TEXT UNIQUE NOT NULL,
  contractor_id UUID REFERENCES contractors(id),
  caller_phone TEXT,
  transcript TEXT,
  extraction JSONB,
  job_id TEXT,
  sms_sent BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Contractor Onboarding Process

For each new contractor:

1. **Purchase Twilio Number**

   ```bash
   twilio phone-numbers:buy:local --country-code US --area-code 512
   ```

2. **Map Number to Contractor**

   ```sql
   UPDATE contractors 
   SET receptionist_phone = '+15125551234' 
   WHERE id = 'contractor-uuid';
   ```

3. **Configure Number in Twilio Console**
   - Set webhook URLs
   - Enable recording and transcription
   - Test with sample call

4. **Provide to Contractor**
   - Give them their new receptionist number
   - Update their website/business cards
   - Configure call forwarding (optional)

## Testing

### Manual Testing

1. **Test Call Flow**

   ```bash
   # Call the Twilio number
   # Leave a message describing a repair job
   # Verify job appears in CRM within 60 seconds
   ```

2. **Test Low Confidence**

   ```bash
   # Call and mumble or speak unclearly
   # Verify voicemail job is created
   ```

3. **Test Emergency Detection**

   ```bash
   # Call and say "emergency" or "urgent"
   # Verify urgency is set to 'high' or 'emergency'
   ```

### Automated Testing

```bash
# Run test suite
npm test -- api/receptionist

# Load testing (simulate high call volume)
artillery run tests/load/receptionist-load.yml
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Call Processing Success Rate** (Target: >99%)
2. **Average Processing Time** (Target: <30 seconds)
3. **Transcription Success Rate** (Target: >95%)
4. **Extraction Confidence** (Average: >0.7)
5. **SMS Delivery Rate** (Target: >90%)

### Alert Conditions

**Critical Alerts** (Page immediately):

- Webhook endpoint down (>5 failures in 5 minutes)
- OpenAI API key expired/invalid
- Twilio credentials invalid
- Database connection failures

**Warning Alerts** (Notify team):

- Low confidence rate >20% in 1 hour
- Transcription failures >10% in 1 hour
- SMS delivery failures >20% in 1 hour
- Unusual call volume spikes

### Monitoring Setup

```typescript
// Example: Datadog monitoring
import { datadogMetrics } from '@datadog/browser-rum'

// Track processing time
datadogMetrics.distribution('receptionist.processing_time', processingTime)

// Track success rate
datadogMetrics.increment('receptionist.calls.total')
datadogMetrics.increment('receptionist.calls.success')

// Track confidence scores
datadogMetrics.distribution('receptionist.extraction.confidence', confidence)
```

## Troubleshooting

### Common Issues

**Issue**: Calls not reaching webhook

- Check Twilio phone number webhook configuration
- Verify endpoint is accessible publicly
- Check firewall rules

**Issue**: Transcription failures

- Verify OpenAI API key is valid and has credits
- Check recording quality (too quiet, too much noise)
- Verify Whisper API quotas

**Issue**: Low extraction confidence

- Review GPT-4o prompts for clarity
- Check if caller history is being used
- Analyze failed transcripts for patterns

**Issue**: SMS not delivered

- Verify Twilio SMS credentials
- Check caller's phone number format (E.164)
- Verify SMS quotas and geographic restrictions

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
DEBUG=receptionist:*

# Logs will show:
# - Full webhook payloads
# - Transcription results
# - Extraction JSON
# - Database queries
# - SMS attempts
```

## Fallback Mechanisms

### Level 1: Retry Logic

All external API calls retry 3 times with exponential backoff

### Level 2: Graceful Degradation

- No transcription → Create voicemail job
- Low confidence → Create manual review job
- SMS failure → Job still created, contractor notified

### Level 3: Ultimate Fallback

If everything fails:

- Create "Missed Call" job with caller's number
- Send critical alert to operations team
- Contractor can manually call back

## Security

### Webhook Validation ✅ IMPLEMENTED

All webhook requests are validated using Twilio's signature verification:

```typescript
// Twilio sends X-Twilio-Signature header with each webhook
// We verify it matches HMAC-SHA1 of request URL + parameters
const isValid = validateTwilioWebhook(req)
if (!isValid) {
  // Reject unauthorized requests
  return 403 Forbidden
}
```

**How it works:**

1. Twilio signs each webhook with your AUTH_TOKEN
2. We recreate the signature using the same algorithm
3. If signatures match, request is authentic
4. If not, request is rejected (prevents spoofing)

**Configuration:**

- Ensure `TWILIO_AUTH_TOKEN` is set in environment variables
- Webhook validation happens automatically on every request
- Failed validations are logged and alerted

### Data Privacy

- Store call recordings securely (encrypted at rest)
- Comply with wiretapping laws (inform callers)
- Delete recordings after 90 days (configurable)
- Redact sensitive information from transcripts

## Cost Estimation

Per call costs:

- Twilio Recording: $0.0025/min
- Twilio Transcription: $0.02/min (optional, we use Whisper)
- OpenAI Whisper: $0.006/min
- OpenAI GPT-4o: ~$0.005 per extraction
- Twilio SMS: $0.0079 per message

**Total: ~$0.02-$0.03 per call**

For 1000 calls/month: **~$20-$30/month**

## Support

For issues or questions:

- Email: <support@fairtradeworker.com>
- Slack: #ai-receptionist-support
- On-call: [PagerDuty rotation]

## Changelog

### v1.0.0 (Current)

- Initial release with 100% reliability guarantee
- Multi-retry logic
- Comprehensive error handling
- Critical alerting
- Graceful degradation

### Future Enhancements

- [ ] Multi-language support (Spanish, French)
- [ ] Voice cloning for contractor branding
- [ ] Appointment scheduling integration
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Real-time call analytics dashboard
