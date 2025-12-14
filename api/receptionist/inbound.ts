/**
 * Twilio Webhook Handler for AI Receptionist
 * POST /api/receptionist/inbound
 * 
 * Processes inbound calls, transcribes, extracts intent with GPT,
 * creates private jobs in CRM, and sends SMS to caller.
 */

// @ts-ignore - Vercel serverless function types
interface VercelRequest {
  method?: string
  body?: any
}

// @ts-ignore - Vercel serverless function types
interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => void
}

interface TwilioCallWebhook {
  From: string // E.164 format: +1234567890
  To: string // Contractor's Twilio number
  CallSid: string
  RecordingUrl?: string
  TranscriptionText?: string
  CallStatus: 'ringing' | 'in-progress' | 'completed' | 'no-answer'
}

interface CallExtraction {
  callerName: string | null
  callerPhone: string
  issueType: 'repair' | 'install' | 'inspect' | 'emergency' | 'quote' | 'other'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  propertyAddress: string | null
  description: string
  estimatedScope: string | null
  confidence: number // 0-1
}

interface ReceptionistResponse {
  success: boolean
  jobId?: string
  smsStatus?: string
  error?: string
  errorCode?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' })
    return
  }

  try {
    const callData = req.body as TwilioCallWebhook
    
    // 1. Match phone number to contractor
    const contractorId = await matchContractorToNumber(callData.To)
    if (!contractorId) {
      res.status(404).json({
        success: false,
        error: 'Contractor not found',
        errorCode: 'CONTRACTOR_NOT_FOUND'
      })
      return
    }

    // 2. Get transcription (or transcribe recording)
    let transcript = callData.TranscriptionText
    if (!transcript && callData.RecordingUrl) {
      const transcribed = await transcribeRecording(callData.RecordingUrl)
      transcript = transcribed || undefined
      if (!transcript) {
        res.status(500).json({
          success: false,
          error: 'Transcription failed',
          errorCode: 'TRANSCRIPTION_FAILED'
        })
        return
      }
    }

    if (!transcript) {
      // Fallback: create voicemail job
      const fallbackJob = await createFallbackJob(contractorId, callData)
      res.json({ success: true, jobId: fallbackJob.id, smsStatus: 'not_sent' })
      return
    }

    // 3. Extract structured data with GPT
    const extraction = await extractCallIntent(transcript, contractorId)
    
    if (extraction.confidence < 0.6) {
      // Low confidence - create voicemail job
      const voicemailJob = await createVoicemailJob(contractorId, callData, transcript)
      res.json({ success: true, jobId: voicemailJob.id, smsStatus: 'low_confidence' })
      return
    }

    // 4. Create private job in CRM
    const job = await createPrivateJob(contractorId, extraction, callData, transcript)
    
    // 5. Send SMS with onboarding link
    const smsStatus = await sendOnboardingSMS(extraction.callerPhone, job.id, contractorId)

    const response: ReceptionistResponse = {
      success: true,
      jobId: job.id,
      smsStatus: smsStatus ? 'sent' : 'failed'
    }

    res.json(response)
  } catch (error) {
    console.error('Receptionist webhook error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}

/**
 * Match Twilio phone number to contractor ID
 */
async function matchContractorToNumber(phoneNumber: string): Promise<string | null> {
  // TODO: Query contractor database for matching Twilio number
  // For now, return mock - will be replaced with actual DB lookup
    const contractors = JSON.parse((process as any).env?.CONTRACTOR_PHONES || '{}')
  return contractors[phoneNumber] || null
}

/**
 * Transcribe audio recording using Whisper
 */
async function transcribeRecording(recordingUrl: string): Promise<string | null> {
  try {
    // TODO: Implement Whisper API call
    // For now, return mock
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(process as any).env?.OPENAI_API_KEY || ''}`,
        'Content-Type': 'multipart/form-data'
      },
      body: JSON.stringify({
        model: 'whisper-1',
        url: recordingUrl
      })
    })
    
    if (!response.ok) return null
    const data = await response.json()
    return data.text || null
  } catch (error) {
    console.error('Whisper transcription error:', error)
    return null
  }
}

/**
 * Extract structured intent from call transcript using GPT-4o
 */
async function extractCallIntent(
  transcript: string,
  contractorId: string
): Promise<CallExtraction> {
  // TODO: Get contractor context for personalization
  const contractorContext = await getContractorContext(contractorId)

  const systemPrompt = `You are an AI receptionist assistant for a contractor. Extract structured information from this phone call transcript.

Contractor: ${contractorContext.name}
Recent jobs context: ${contractorContext.recentJobs || 'None'}

Return a JSON object with:
- callerName: extracted name or null
- callerPhone: (will be provided separately)
- issueType: one of: repair, install, inspect, emergency, quote, other
- urgency: low, medium, high, or emergency
- propertyAddress: full address if mentioned, or null
- description: full issue summary (max 500 chars)
- estimatedScope: AI guess like "small repair" or "major project", or null
- confidence: 0-1 score of extraction confidence

Transcript: "${transcript}"

Return ONLY valid JSON, no markdown formatting.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${(process as any).env?.OPENAI_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract data from: ${transcript}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in GPT response')
    }
    const extraction = JSON.parse(content) as CallExtraction
    
    return extraction
  } catch (error) {
    console.error('GPT extraction error:', error)
    // Return low-confidence fallback
    return {
      callerName: null,
      callerPhone: '',
      issueType: 'other',
      urgency: 'medium',
      propertyAddress: null,
      description: transcript.substring(0, 500),
      estimatedScope: null,
      confidence: 0.3
    }
  }
}

/**
 * Get contractor context for personalization
 */
async function getContractorContext(contractorId: string) {
  // TODO: Query contractor data + recent jobs
  return {
    name: 'Contractor',
    recentJobs: []
  }
}

/**
 * Create private job in contractor's CRM
 */
async function createPrivateJob(
  contractorId: string,
  extraction: CallExtraction,
  callData: TwilioCallWebhook,
  transcript: string
) {
  // TODO: Create job in localStorage/DB
  // For now, return mock structure
  const job = {
    id: `private-job-${Date.now()}`,
    contractorId,
    type: 'private',
    title: extraction.description.substring(0, 100) || 'New Lead',
    description: extraction.description,
    homeownerName: extraction.callerName || 'Unknown Caller',
    homeownerPhone: extraction.callerPhone,
    address: extraction.propertyAddress || '',
    issueType: extraction.issueType,
    urgency: extraction.urgency,
    estimatedScope: extraction.estimatedScope,
    status: 'new',
    source: 'ai_receptionist',
    callSid: callData.CallSid,
    transcript,
    recordingUrl: callData.RecordingUrl,
    createdAt: new Date().toISOString()
  }

  // Store in useLocalKV format: jobs/{contractorId}/{jobId}
  // This will be handled by the frontend component
  
  return job
}

/**
 * Create fallback job for voicemail/low confidence
 */
async function createVoicemailJob(
  contractorId: string,
  callData: TwilioCallWebhook,
  transcript?: string
) {
  return {
    id: `voicemail-${Date.now()}`,
    contractorId,
    type: 'private',
    title: 'Voicemail',
    description: transcript || 'No transcription available',
    homeownerPhone: callData.From,
    status: 'voicemail',
    source: 'ai_receptionist',
    callSid: callData.CallSid,
    recordingUrl: callData.RecordingUrl,
    createdAt: new Date().toISOString()
  }
}

async function createFallbackJob(
  contractorId: string,
  callData: TwilioCallWebhook
) {
  return {
    id: `missed-call-${Date.now()}`,
    contractorId,
    type: 'private',
    title: 'Missed Call',
    description: 'No recording or transcription available',
    homeownerPhone: callData.From,
    status: 'missed',
    source: 'ai_receptionist',
    callSid: callData.CallSid,
    createdAt: new Date().toISOString()
  }
}

/**
 * Send SMS with onboarding link to caller
 */
async function sendOnboardingSMS(
  phoneNumber: string,
  jobId: string,
  contractorId: string
): Promise<boolean> {
  try {
    // TODO: Implement Twilio SMS
    const accountSid = (process as any).env?.TWILIO_ACCOUNT_SID
    const authToken = (process as any).env?.TWILIO_AUTH_TOKEN
    const fromNumber = (process as any).env?.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured')
      return false
    }

    const onboardingUrl = `https://fairtradeworker.com/onboard?job=${jobId}&contractor=${contractorId}`
    const message = `Thanks for calling! We've created your job request. Complete your profile here: ${onboardingUrl}`

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneNumber,
          Body: message
        })
      }
    )

    return response.ok
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}
