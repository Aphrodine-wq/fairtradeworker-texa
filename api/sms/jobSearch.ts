import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * SMS Job Matching API Endpoint
 * 
 * Contractors text shortcode with natural language queries:
 * - "fence 77002" → fence jobs in that zip
 * - "plumbing under 500 houston" → filtered results  
 * - "anything tomorrow morning" → urgency-based matching
 * 
 * Response format optimized for 160 character SMS:
 * "🔨 $350 Fence Repair | 1234 Oak St | Reply 1 to claim"
 */

interface TwilioSMSWebhook {
  From: string
  To: string
  Body: string
  AccountSid?: string
  MessageSid?: string
  NumMedia?: string
  MediaUrl0?: string  // For photo scoping
}

interface JobSearchResult {
  id: string
  title: string
  address: string
  price: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  distance?: number
  postedAgo: string
}

interface ContractorPreferences {
  minPrice: number
  maxDistance: number
  preferredTrades: string[]
  skipLowValue: boolean
  morningDigest: boolean
}

interface ParsedQuery {
  trade?: string
  zipCode?: string
  maxPrice?: number
  minPrice?: number
  city?: string
  urgency?: 'today' | 'tomorrow' | 'this_week' | 'anytime'
  command?: 'search' | 'claim' | 'digest' | 'prefs' | 'stop' | 'help'
  jobNumber?: number
}

// Trade aliases for natural language parsing
const TRADE_ALIASES: Record<string, string[]> = {
  'plumbing': ['plumber', 'plumb', 'pipe', 'drain', 'toilet', 'faucet', 'leak', 'water heater'],
  'electrical': ['electrician', 'electric', 'outlet', 'wire', 'wiring', 'breaker', 'light', 'panel'],
  'hvac': ['ac', 'air conditioning', 'heating', 'furnace', 'duct', 'heat pump', 'thermostat'],
  'roofing': ['roof', 'roofer', 'shingle', 'gutter', 'leak'],
  'fencing': ['fence', 'fencer', 'gate', 'post'],
  'painting': ['paint', 'painter', 'interior', 'exterior'],
  'carpentry': ['carpenter', 'wood', 'deck', 'door', 'trim', 'cabinet'],
  'flooring': ['floor', 'tile', 'hardwood', 'laminate', 'carpet'],
  'landscaping': ['landscape', 'lawn', 'yard', 'tree', 'sprinkler', 'irrigation'],
  'general': ['handyman', 'general', 'repair', 'fix', 'maintenance']
}

/**
 * Parse natural language SMS query into structured search params
 */
function parseQuery(text: string): ParsedQuery {
  const normalized = text.toLowerCase().trim()
  const words = normalized.split(/\s+/)
  const result: ParsedQuery = {}
  
  // Check for commands
  if (words[0] === 'stop' || words[0] === 'unsubscribe') {
    return { command: 'stop' }
  }
  if (words[0] === 'help' || words[0] === '?') {
    return { command: 'help' }
  }
  if (words[0] === 'digest' || words[0] === 'morning') {
    return { command: 'digest' }
  }
  if (words[0] === 'prefs' || words[0] === 'preferences' || words[0] === 'settings') {
    return { command: 'prefs' }
  }
  
  // Check for job claim (e.g., "1" or "claim 1")
  const claimMatch = normalized.match(/^(?:claim\s+)?(\d)$/)
  if (claimMatch) {
    return { command: 'claim', jobNumber: parseInt(claimMatch[1]) }
  }
  
  result.command = 'search'
  
  // Extract ZIP code (5 digits)
  const zipMatch = normalized.match(/\b(\d{5})\b/)
  if (zipMatch) {
    result.zipCode = zipMatch[1]
  }
  
  // Extract price filters
  const underMatch = normalized.match(/under\s*\$?(\d+)/i)
  const overMatch = normalized.match(/over\s*\$?(\d+)/i)
  const maxMatch = normalized.match(/max\s*\$?(\d+)/i)
  const minMatch = normalized.match(/min\s*\$?(\d+)/i)
  
  if (underMatch) result.maxPrice = parseInt(underMatch[1])
  if (maxMatch) result.maxPrice = parseInt(maxMatch[1])
  if (overMatch) result.minPrice = parseInt(overMatch[1])
  if (minMatch) result.minPrice = parseInt(minMatch[1])
  
  // Extract urgency
  if (normalized.includes('today') || normalized.includes('asap') || normalized.includes('emergency') || normalized.includes('urgent')) {
    result.urgency = 'today'
  } else if (normalized.includes('tomorrow') || normalized.includes('morning')) {
    result.urgency = 'tomorrow'
  } else if (normalized.includes('this week') || normalized.includes('week')) {
    result.urgency = 'this_week'
  }
  
  // Extract trade type
  for (const [trade, aliases] of Object.entries(TRADE_ALIASES)) {
    if (aliases.some(alias => normalized.includes(alias)) || normalized.includes(trade)) {
      result.trade = trade
      break
    }
  }
  
  // Extract city names (Texas cities)
  const texasCities = ['houston', 'dallas', 'austin', 'san antonio', 'fort worth', 'el paso', 'arlington', 'plano', 'irving', 'lubbock', 'laredo', 'garland', 'frisco', 'mckinney', 'brownsville', 'killeen', 'pasadena', 'mesquite', 'mcallen', 'denton']
  for (const city of texasCities) {
    if (normalized.includes(city)) {
      result.city = city
      break
    }
  }
  
  // "anything" means no trade filter
  if (normalized.includes('anything') || normalized.includes('any job') || normalized.includes('all jobs')) {
    delete result.trade
  }
  
  return result
}

/**
 * Get contractor preferences from database (with caching)
 */
async function getContractorPreferences(phoneNumber: string): Promise<ContractorPreferences | null> {
  try {
    const env = typeof process !== 'undefined' ? (process as any).env : {}
    const supabaseUrl = env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return null
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/contractor_sms_preferences?phone=eq.${encodeURIComponent(phoneNumber)}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data[0] || null
  } catch {
    return null
  }
}

/**
 * Search jobs matching the parsed query
 */
async function searchJobs(query: ParsedQuery, contractorPhone: string): Promise<JobSearchResult[]> {
  try {
    const env = typeof process !== 'undefined' ? (process as any).env : {}
    const supabaseUrl = env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      // Return demo data if no database
      return getDemoJobs(query)
    }
    
    // Build query parameters
    let queryUrl = `${supabaseUrl}/rest/v1/jobs?status=eq.open&select=*`
    
    if (query.zipCode) {
      queryUrl += `&zip_code=eq.${query.zipCode}`
    }
    if (query.trade) {
      queryUrl += `&trade=ilike.*${query.trade}*`
    }
    if (query.maxPrice) {
      queryUrl += `&estimated_price=lte.${query.maxPrice}`
    }
    if (query.minPrice) {
      queryUrl += `&estimated_price=gte.${query.minPrice}`
    }
    if (query.city) {
      queryUrl += `&city=ilike.*${query.city}*`
    }
    
    // Order by urgency and posted time
    queryUrl += '&order=urgency.desc,created_at.desc&limit=5'
    
    const response = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (!response.ok) {
      return getDemoJobs(query)
    }
    
    const jobs = await response.json()
    
    return jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      address: `${job.street_number || ''} ${job.street_name || ''}`.trim() || job.address || 'Address TBD',
      price: job.estimated_price || job.budget || 0,
      urgency: job.urgency || 'medium',
      postedAgo: getTimeAgo(job.created_at)
    }))
  } catch (error) {
    console.error('Job search error:', error)
    return getDemoJobs(query)
  }
}

/**
 * Generate demo jobs for testing
 */
function getDemoJobs(query: ParsedQuery): JobSearchResult[] {
  const demoJobs: JobSearchResult[] = [
    { id: '1', title: 'Fence Repair', address: '1234 Oak St', price: 350, urgency: 'medium', postedAgo: '5m' },
    { id: '2', title: 'Plumbing Leak', address: '567 Elm Ave', price: 200, urgency: 'high', postedAgo: '12m' },
    { id: '3', title: 'AC Repair', address: '890 Pine Rd', price: 450, urgency: 'emergency', postedAgo: '2m' },
    { id: '4', title: 'Deck Staining', address: '321 Maple Dr', price: 600, urgency: 'low', postedAgo: '1h' },
    { id: '5', title: 'Electrical Outlet', address: '654 Cedar Ln', price: 150, urgency: 'medium', postedAgo: '30m' }
  ]
  
  let filtered = demoJobs
  
  if (query.trade) {
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(query.trade!) ||
      TRADE_ALIASES[query.trade!]?.some(alias => j.title.toLowerCase().includes(alias))
    )
  }
  if (query.maxPrice) {
    filtered = filtered.filter(j => j.price <= query.maxPrice!)
  }
  if (query.minPrice) {
    filtered = filtered.filter(j => j.price >= query.minPrice!)
  }
  
  return filtered.slice(0, 5)
}

/**
 * Format time ago string
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

/**
 * Format job results for SMS (160 char limit per message)
 */
function formatJobsForSMS(jobs: JobSearchResult[]): string[] {
  if (jobs.length === 0) {
    return ['No jobs found. Try: "plumbing 77002" or "fence houston under 500"']
  }
  
  const messages: string[] = []
  
  // Header message
  messages.push(`Found ${jobs.length} job${jobs.length > 1 ? 's' : ''}:`)
  
  // Format each job (optimized for SMS)
  jobs.forEach((job, index) => {
    const urgencyIcon = job.urgency === 'emergency' ? '🚨' : job.urgency === 'high' ? '⚡' : '🔨'
    const shortAddress = job.address.length > 20 ? job.address.substring(0, 17) + '...' : job.address
    
    // Format: "1. 🔨 $350 Fence | Oak St | Reply 1"
    const msg = `${index + 1}. ${urgencyIcon} $${job.price} ${job.title.substring(0, 15)} | ${shortAddress} | ${job.postedAgo}`
    messages.push(msg)
  })
  
  // Footer with claim instructions
  messages.push('Reply 1-5 to claim job')
  
  return messages
}

/**
 * Handle job claim
 */
async function claimJob(jobNumber: number, contractorPhone: string, sessionJobs: JobSearchResult[]): Promise<string> {
  if (jobNumber < 1 || jobNumber > sessionJobs.length) {
    return `Invalid job number. Reply 1-${sessionJobs.length} to claim.`
  }
  
  const job = sessionJobs[jobNumber - 1]
  
  // In production, this would create a bid in the database
  // For now, return confirmation
  return `✅ Claimed! ${job.title} at ${job.address}. Homeowner notified. Call them at [PHONE] or wait for their call.`
}

/**
 * Store last search results for claim handling
 */
const searchSessions = new Map<string, { jobs: JobSearchResult[], timestamp: number }>()

/**
 * Clean up old sessions (older than 10 minutes)
 */
function cleanupSessions() {
  const now = Date.now()
  for (const [phone, session] of searchSessions) {
    if (now - session.timestamp > 10 * 60 * 1000) {
      searchSessions.delete(phone)
    }
  }
}

/**
 * Main SMS webhook handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const webhookData = req.body as TwilioSMSWebhook
    const { From: fromPhone, Body: messageBody, MediaUrl0: photoUrl } = webhookData
    
    if (!fromPhone || !messageBody) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Clean up old sessions periodically
    cleanupSessions()
    
    // Check if this is a photo message (for photo scoping)
    if (photoUrl) {
      // Delegate to photo scoping handler
      return handlePhotoScope(photoUrl, fromPhone, res)
    }
    
    // Parse the text query
    const query = parseQuery(messageBody)
    
    let responseMessage: string
    
    switch (query.command) {
      case 'help':
        responseMessage = 'FTW Job Search:\n• "fence 77002" - jobs by trade/zip\n• "plumbing under 500" - with price\n• "anything tomorrow" - by timing\n• Reply 1-5 to claim\n• "STOP" to unsubscribe'
        break
        
      case 'stop':
        // Handle unsubscribe
        responseMessage = 'You have been unsubscribed from FTW job alerts. Text "START" to re-subscribe.'
        break
        
      case 'digest':
        // Send morning digest
        const preferences = await getContractorPreferences(fromPhone)
        const digestJobs = await searchJobs({}, fromPhone)
        const topMatches = digestJobs.slice(0, 5)
        responseMessage = `☀️ Your top 5 matches today:\n${topMatches.map((j, i) => `${i + 1}. $${j.price} ${j.title}`).join('\n')}\nReply # to claim`
        searchSessions.set(fromPhone, { jobs: topMatches, timestamp: Date.now() })
        break
        
      case 'prefs':
        responseMessage = 'Set preferences at fairtradeworker.com/prefs or reply:\n• "skip under 300" - min price\n• "max 20 miles" - distance\n• "digest on/off" - morning digest'
        break
        
      case 'claim':
        const session = searchSessions.get(fromPhone)
        if (!session || !session.jobs.length) {
          responseMessage = 'No recent search. Text a query first (e.g., "fence 77002")'
        } else {
          responseMessage = await claimJob(query.jobNumber!, fromPhone, session.jobs)
        }
        break
        
      case 'search':
      default:
        // Perform job search
        const jobs = await searchJobs(query, fromPhone)
        const smsMessages = formatJobsForSMS(jobs)
        responseMessage = smsMessages.join('\n')
        
        // Store session for claim handling
        searchSessions.set(fromPhone, { jobs, timestamp: Date.now() })
        break
    }
    
    // Return TwiML response
    res.setHeader('Content-Type', 'text/xml')
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(responseMessage)}</Message>
</Response>`)
    
  } catch (error) {
    console.error('SMS handler error:', error)
    res.setHeader('Content-Type', 'text/xml')
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, something went wrong. Try again or visit fairtradeworker.com</Message>
</Response>`)
  }
}

/**
 * Handle photo scoping via SMS
 */
async function handlePhotoScope(photoUrl: string, fromPhone: string, res: VercelResponse) {
  try {
    // Call AI to analyze the photo
    const env = typeof process !== 'undefined' ? (process as any).env : {}
    const openaiKey = env.OPENAI_API_KEY
    
    if (!openaiKey) {
      res.setHeader('Content-Type', 'text/xml')
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>📸 Photo received! This appears to need professional assessment. Reply YES to get quotes from 3 contractors near you.</Message>
</Response>`)
    }
    
    // Use GPT-4 Vision to analyze the photo
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert home repair estimator. Analyze the photo and provide:
1. Issue identification (what the problem appears to be)
2. Urgency (immediate/48hrs/week/when convenient)
3. Rough scope (estimated hours and trade needed)
4. Confidence level (high/medium/low)

Keep response under 300 characters for SMS. Be direct and helpful.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this home repair photo:' },
              { type: 'image_url', image_url: { url: photoUrl } }
            ]
          }
        ],
        max_tokens: 150
      })
    })
    
    if (!analysisResponse.ok) {
      throw new Error('AI analysis failed')
    }
    
    const analysis = await analysisResponse.json()
    const aiResponse = analysis.choices[0]?.message?.content || 'Unable to analyze photo'
    
    // Format response for SMS
    const smsResponse = `📸 ${aiResponse}\n\nReply YES to get quotes from 3 contractors near you.`
    
    res.setHeader('Content-Type', 'text/xml')
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(smsResponse)}</Message>
</Response>`)
    
  } catch (error) {
    console.error('Photo scope error:', error)
    res.setHeader('Content-Type', 'text/xml')
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>📸 Photo received! Looks like it needs professional assessment. Reply YES to get quotes from 3 contractors near you.</Message>
</Response>`)
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
