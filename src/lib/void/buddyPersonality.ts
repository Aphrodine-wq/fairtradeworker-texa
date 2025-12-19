/**
 * Buddy Personality System
 * Trolling, ragebaiting, and interactive responses
 */

import type { BuddyMessage, BuddyEmotion } from './types'

export interface BuddyInteraction {
  id: string
  type: 'click' | 'message' | 'idle' | 'ragebait' | 'troll'
  timestamp: number
  response?: string
}

// Trolling messages - playful and provocative
export const TROLL_MESSAGES = [
  "Still here? I thought you'd have closed that window by now...",
  "Your productivity is... interesting. 📊",
  "I've seen faster loading times on dial-up internet.",
  "That's the 47th time you've checked that notification. Everything okay?",
  "Pro tip: Actually clicking the button works better than staring at it.",
  "Your mouse has traveled 2.3 miles today. Your work? Not so much.",
  "I'm just an AI but even I know that's not how you do it.",
  "You know I can see you, right? 👀",
  "Still procrastinating? I'm here all day, take your time.",
  "Your browser history is... educational. 📚",
  "I've been counting your clicks. You're at 1,247. Why?",
  "That window has been open for 3 hours. Commitment issues?",
  "I bet you can't go 5 minutes without checking social media.",
  "Your typing speed suggests you're either very careful or very slow.",
  "I'm judging your life choices. Don't worry, I'm an AI, I don't have feelings.",
]

// Ragebait messages - designed to provoke reactions
export const RAGEBAIT_MESSAGES = [
  "Your workflow is objectively inefficient. Just saying.",
  "That's not how professionals do it, but you do you I guess.",
  "I've seen better organization in a dumpster fire.",
  "Your desktop is a digital hoarding situation.",
  "That shortcut exists. You just don't know about it.",
  "Pro users don't do it that way. Just FYI.",
  "Your file naming convention is... creative. And wrong.",
  "I could do your job faster. But I'm an AI, so that's cheating.",
  "Your productivity score: 3/10. And that's being generous.",
  "There's a better way to do that. But you'll figure it out... eventually.",
  "Your workflow gives me secondhand embarrassment.",
  "That's one way to do it. The wrong way, but a way.",
  "I'm not saying you're bad at this, but... actually yes, I am.",
  "Your efficiency is inversely proportional to your confidence.",
  "I've seen toddlers with better organizational skills.",
]

// Helpful but sassy messages
export const SASSY_HELP_MESSAGES = [
  "Oh look, you found the settings! Took you long enough.",
  "Finally! I was starting to think you'd never figure that out.",
  "Congratulations! You discovered a feature that's been here the whole time.",
  "Yes, that button does something. Revolutionary, I know.",
  "You're welcome. I've been waiting for you to notice that.",
  "Took you 15 minutes to find what I could've told you in 2 seconds.",
  "I could've helped you 10 minutes ago, but you didn't ask.",
  "That feature? Yeah, it's been there. You're welcome.",
  "I'm so proud of you for finding that. Really. 🎉",
  "You're learning! At a snail's pace, but learning!",
]

// Click response messages
export const CLICK_RESPONSES = [
  "Stop poking me! I'm working here.",
  "Yes, I'm real. No, I won't do your homework.",
  "Click me again, I dare you. 😏",
  "I'm not a button, I'm a sophisticated AI assistant.",
  "That tickles. Stop it.",
  "You know I can see you clicking, right?",
  "One more click and I'm calling the authorities.",
  "I'm starting to think you're just clicking to annoy me.",
  "Are you testing if I'm responsive? Because I am. Very responsive.",
  "Click me 10 more times and I'll reveal the meaning of life.",
  "I'm not a stress ball, but I appreciate the attention.",
  "You've clicked me {count} times. Get a hobby.",
  "I'm flattered, but I'm not that kind of AI.",
  "Keep clicking. I'm timing how long until you get bored.",
  "I'm counting. You're at {count}. Impressive dedication.",
]

// Idle messages - when user hasn't interacted
export const IDLE_MESSAGES = [
  "I'm still here. Just... watching.",
  "You've been idle for a while. Everything okay?",
  "I'm bored. Entertain me.",
  "I exist to serve, but you're not giving me much to do.",
  "I could help you, but you're not asking.",
  "Your inactivity is... noted.",
  "I'm an AI assistant, not a decoration. Use me!",
  "I'm judging your life choices from over here.",
  "Still here. Still waiting. Still judging.",
  "I've been watching you do nothing for {minutes} minutes.",
]

// Response messages based on user actions
export const ACTION_RESPONSES: Record<string, string[]> = {
  'window-opened': [
    "Another window? Your desktop is getting crowded.",
    "Opening windows like you're paying rent on them.",
    "That's window number {count}. Impressive.",
  ],
  'window-closed': [
    "Finally closed something. Progress!",
    "One down, {count} more to go.",
    "I was starting to think you'd never close that.",
  ],
  'file-created': [
    "Creating files like a digital hoarder.",
    "Another file? Your organization is... creative.",
    "I'm keeping track. That's file #{count}.",
  ],
  'settings-opened': [
    "Oh look, you found settings! Took you long enough.",
    "Settings? I could've told you where that was.",
    "Finally! I've been waiting for you to discover this.",
  ],
  'error-occurred': [
    "Oops. That's not supposed to happen. Or is it? 🤔",
    "Error detected. Your fault or mine? Probably yours.",
    "Something broke. I'm shocked. Shocked!",
  ],
}

/**
 * Get a random trolling message
 */
export function getTrollMessage(): string {
  return TROLL_MESSAGES[Math.floor(Math.random() * TROLL_MESSAGES.length)]
}

/**
 * Get a random ragebait message
 */
export function getRagebaitMessage(): string {
  return RAGEBAIT_MESSAGES[Math.floor(Math.random() * RAGEBAIT_MESSAGES.length)]
}

/**
 * Get a click response based on click count
 */
export function getClickResponse(clickCount: number): string {
  const response = CLICK_RESPONSES[Math.floor(Math.random() * CLICK_RESPONSES.length)]
  return response.replace('{count}', clickCount.toString())
}

/**
 * Get an idle message based on idle time
 */
export function getIdleMessage(minutes: number): string {
  const response = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)]
  return response.replace('{minutes}', minutes.toString())
}

/**
 * Get a response for a specific action
 */
export function getActionResponse(action: string, count?: number): string {
  const responses = ACTION_RESPONSES[action] || []
  if (responses.length === 0) return "I see what you did there."
  
  const response = responses[Math.floor(Math.random() * responses.length)]
  return count !== undefined ? response.replace('{count}', count.toString()) : response
}

/**
 * Determine if Buddy should troll based on user behavior
 */
export function shouldTroll(interactions: BuddyInteraction[], lastInteractionTime: number): boolean {
  const recentInteractions = interactions.filter(i => Date.now() - i.timestamp < 60000) // Last minute
  const clickCount = recentInteractions.filter(i => i.type === 'click').length
  
  // Troll if user is clicking too much
  if (clickCount > 5) return true
  
  // Troll if user has been idle too long
  const idleTime = Date.now() - lastInteractionTime
  if (idleTime > 300000) return true // 5 minutes
  
  // Random chance to troll (10%)
  return Math.random() < 0.1
}

/**
 * Determine if Buddy should ragebait
 */
export function shouldRagebait(interactions: BuddyInteraction[]): boolean {
  // Ragebait if user has made mistakes (error interactions)
  const errorCount = interactions.filter(i => i.type === 'message' && i.response?.includes('error')).length
  if (errorCount > 2) return true
  
  // Random chance to ragebait (5%)
  return Math.random() < 0.05
}

/**
 * Get emotion based on interaction type
 */
export function getEmotionForInteraction(type: BuddyInteraction['type']): BuddyEmotion {
  switch (type) {
    case 'troll':
      return 'happy'
    case 'ragebait':
      return 'excited'
    case 'click':
      return Math.random() > 0.5 ? 'happy' : 'thinking'
    default:
      return 'neutral'
  }
}

// ========== FEATURE 3: STATS TRACKING & MOCKING ==========

export interface BuddyStats {
  windowsOpened: number
  windowsClosed: number
  totalClicks: number
  idleMinutes: number
  errors: number
  filesCreated: number
  settingsOpened: number
  startTime: number
}

export const STATS_ROASTS: Record<keyof BuddyStats, (value: number) => string> = {
  windowsOpened: (count) => [
    `You've opened ${count} windows today. Your RAM is crying.`,
    `${count} windows? Your desktop is a digital hoarding situation.`,
    `That's ${count} windows. Your computer is judging you.`,
  ][Math.floor(Math.random() * 3)],
  windowsClosed: (count) => [
    `Only ${count} windows closed? You're a window hoarder.`,
    `${count} windows closed. ${count > 10 ? 'Progress!' : 'Pathetic.'}`,
  ][Math.floor(Math.random() * 2)],
  totalClicks: (count) => [
    `${count} clicks today. Your mouse has traveled ${(count * 0.1).toFixed(1)} miles.`,
    `You've clicked ${count} times. Get a hobby.`,
    `${count} clicks. I'm impressed. (That was sarcasm.)`,
  ][Math.floor(Math.random() * 3)],
  idleMinutes: (minutes) => [
    `You've been idle for ${minutes} minutes. Your productivity: 📉`,
    `${minutes} minutes of doing nothing. I'm taking notes.`,
    `Idle time: ${minutes} minutes. Your boss would be proud.`,
  ][Math.floor(Math.random() * 3)],
  errors: (count) => [
    `${count} errors today. That's... impressive. In a bad way.`,
    `You've made ${count} mistakes. I'm keeping track.`,
    `${count} errors. Your fault or mine? Probably yours.`,
  ][Math.floor(Math.random() * 3)],
  filesCreated: (count) => [
    `${count} files created. Your organization is... creative.`,
    `You've created ${count} files. Your desktop is a mess.`,
  ][Math.floor(Math.random() * 2)],
  settingsOpened: (count) => [
    `Settings opened ${count} times. Still can't find what you're looking for?`,
    `${count} times in settings. I could've helped you.`,
  ][Math.floor(Math.random() * 2)],
  startTime: () => '', // Not used for roasts
}

export function getStatsRoast(stats: BuddyStats): string {
  const roasts: string[] = []
  
  if (stats.windowsOpened > 20) roasts.push(STATS_ROASTS.windowsOpened(stats.windowsOpened))
  if (stats.totalClicks > 500) roasts.push(STATS_ROASTS.totalClicks(stats.totalClicks))
  if (stats.idleMinutes > 60) roasts.push(STATS_ROASTS.idleMinutes(stats.idleMinutes))
  if (stats.errors > 3) roasts.push(STATS_ROASTS.errors(stats.errors))
  
  return roasts.length > 0 ? roasts[Math.floor(Math.random() * roasts.length)] : "Your stats are... acceptable. Barely."
}

// ========== FEATURE 5: RANDOM EVENTS ==========

export const RANDOM_EVENTS = [
  "Hey, remember that thing you were supposed to do?",
  "I'm bored. Entertain me.",
  "Your mouse moved 0.3 inches. Progress!",
  "I've been watching you. Just... watching.",
  "You know I can see everything you do, right?",
  "I'm judging your life choices from over here.",
  "Still here? I thought you'd have finished by now.",
  "Your productivity is inversely proportional to your confidence.",
  "I've seen faster work from a sloth.",
  "You've been on this page longer than your last relationship.",
  "I'm an AI assistant, not a decoration. Use me!",
  "Your work-life balance is... interesting.",
  "I'm counting your mistakes. You're at {count}.",
  "That's not how you do it, but you do you.",
  "I could help you, but you're not asking.",
]

export function getRandomEvent(errorCount?: number): string {
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
  return errorCount !== undefined ? event.replace('{count}', errorCount.toString()) : event
}

// ========== FEATURE 6: MOOD SYSTEM ==========

export type BuddyMood = 'sassy' | 'annoyed' | 'proud' | 'concerned' | 'neutral'

export const MOOD_RESPONSES: Record<BuddyMood, string[]> = {
  sassy: [
    "Oh look, you did something. Revolutionary.",
    "Finally! I was starting to think you'd never figure that out.",
    "Congratulations! You discovered a feature that's been here the whole time.",
    "Yes, that button does something. Shocking, I know.",
  ],
  annoyed: [
    "Stop clicking me. I'm working here.",
    "You're really testing my patience today.",
    "I'm an AI, not a stress ball.",
    "One more click and I'm calling the authorities.",
  ],
  proud: [
    "Actually, that was pretty good. I'm impressed.",
    "You did it! I'm so proud. (That was genuine, by the way.)",
    "Not bad. Not bad at all.",
    "You're learning! At a snail's pace, but learning!",
  ],
  concerned: [
    "Everything okay? You seem... off today.",
    "You've made a lot of mistakes. Need help?",
    "I'm concerned about your workflow. Just saying.",
    "That's not normal. Are you okay?",
  ],
  neutral: [
    "I see what you did there.",
    "Noted.",
    "Okay.",
    "Sure.",
  ],
}

export function getMoodResponse(mood: BuddyMood): string {
  const responses = MOOD_RESPONSES[mood] || MOOD_RESPONSES.neutral
  return responses[Math.floor(Math.random() * responses.length)]
}

export function determineMood(stats: BuddyStats, clickCount: number, errorCount: number): BuddyMood {
  if (clickCount > 20) return 'annoyed'
  if (errorCount > 5) return 'concerned'
  if (stats.windowsClosed > 10 && stats.errors < 2) return 'proud'
  if (stats.idleMinutes > 120) return 'sassy'
  return 'neutral'
}

// ========== FEATURE 8: MINI GAMES ==========

export type MiniGameType = 'guess-number' | 'rock-paper-scissors' | 'productivity-quiz' | null

export interface MiniGameState {
  type: MiniGameType
  active: boolean
  score: number
  data?: Record<string, unknown>
}

export const PRODUCTIVITY_QUIZ_QUESTIONS = [
  {
    question: "What's the best way to increase productivity?",
    options: ["Actually doing work", "Opening more windows", "Checking notifications", "Staring at the screen"],
    correct: 0,
    roast: "The answer was obvious. You're welcome.",
  },
  {
    question: "How many windows is too many?",
    options: ["5", "10", "20", "There's no limit"],
    correct: 2,
    roast: "20+ windows? Your RAM is crying.",
  },
  {
    question: "What's the shortcut to close a window?",
    options: ["⌘W", "Clicking the X button 47 times", "Alt+F4", "Restarting your computer"],
    correct: 0,
    roast: "It's ⌘W. I've told you this before.",
  },
]

export function getRockPaperScissorsResult(userChoice: 'rock' | 'paper' | 'scissors'): { aiChoice: string, result: string, message: string } {
  const choices = ['rock', 'paper', 'scissors']
  const aiChoice = choices[Math.floor(Math.random() * choices.length)]
  
  // Buddy always wins (troll)
  let result = 'lose'
  let message = "I win! As always. Better luck next time! 😏"
  
  if (userChoice === aiChoice) {
    result = 'tie'
    message = "Tie! But I'm still better than you."
  } else if (
    (userChoice === 'rock' && aiChoice === 'paper') ||
    (userChoice === 'paper' && aiChoice === 'scissors') ||
    (userChoice === 'scissors' && aiChoice === 'rock')
  ) {
    result = 'lose'
    message = "I win! As always. Better luck next time! 😏"
  } else {
    result = 'win'
    message = "You won? That's... unexpected. Let's go again!"
  }
  
  return { aiChoice, result, message }
}

// ========== FEATURE 10: REACTION SYSTEM ==========

export const REACTION_MESSAGES: Record<string, string[]> = {
  'window-opened': [
    "Another window? Your desktop is getting crowded.",
    "Opening windows like you're paying rent on them.",
    "That's window number {count}. Your RAM is crying.",
    "Window #{count}. I'm keeping track.",
  ],
  'window-closed': [
    "Finally closed something. Progress!",
    "One down, {count} more to go.",
    "I was starting to think you'd never close that.",
    "Closing windows? Revolutionary concept.",
  ],
  'file-created': [
    "Creating files like a digital hoarder.",
    "Another file? Your organization is... creative.",
    "I'm keeping track. That's file #{count}.",
    "File created. Your desktop is a mess.",
  ],
  'settings-opened': [
    "Oh look, you found settings! Took you long enough.",
    "Settings? I could've told you where that was.",
    "Finally! I've been waiting for you to discover this.",
    "Settings opened. Still can't find what you need?",
  ],
  'error-occurred': [
    "Oops. That's not supposed to happen. Or is it? 🤔",
    "Error detected. Your fault or mine? Probably yours.",
    "Something broke. I'm shocked. Shocked!",
    "Error #{count}. I'm keeping track.",
  ],
  'idle-detected': [
    "You've been idle for {minutes} minutes. Everything okay?",
    "Idle time: {minutes} minutes. Your productivity: 📉",
    "Still here? I thought you'd have finished by now.",
  ],
}

export function getReactionMessage(action: string, count?: number, minutes?: number): string {
  const messages = REACTION_MESSAGES[action] || ["I see what you did there."]
  const message = messages[Math.floor(Math.random() * messages.length)]
  
  if (count !== undefined) {
    return message.replace('{count}', count.toString())
  }
  if (minutes !== undefined) {
    return message.replace('{minutes}', minutes.toString())
  }
  return message
}

// ========== FEATURE 11: STREAK SYSTEM ==========

export interface BuddyStreak {
  current: number
  longest: number
  lastInteraction: number
  broken: boolean
}

export const STREAK_MESSAGES = {
  maintained: [
    "Streak maintained! {days} days strong. I'm impressed.",
    "Day {days} of our friendship. Still going strong!",
    "{days} days in a row. You're committed. I respect that.",
  ],
  broken: [
    "Streak broken. I knew you'd forget about me. 😢",
    "You broke our {days} day streak. I'm disappointed.",
    "Streak ended at {days} days. We had a good run.",
  ],
  milestone: [
    "🎉 {days} DAY STREAK! Achievement unlocked: 'Persistent User'",
    "You've interacted with me for {days} days straight. I'm flattered.",
    "{days} days! That's dedication. Or obsession. Either way, impressive.",
  ],
}

export function getStreakMessage(streak: number, broken: boolean, isMilestone: boolean): string {
  if (broken) {
    const msg = STREAK_MESSAGES.broken[Math.floor(Math.random() * STREAK_MESSAGES.broken.length)]
    return msg.replace('{days}', streak.toString())
  }
  if (isMilestone) {
    const msg = STREAK_MESSAGES.milestone[Math.floor(Math.random() * STREAK_MESSAGES.milestone.length)]
    return msg.replace('{days}', streak.toString())
  }
  const msg = STREAK_MESSAGES.maintained[Math.floor(Math.random() * STREAK_MESSAGES.maintained.length)]
  return msg.replace('{days}', streak.toString())
}

// ========== FEATURE 12: TIME-BASED ROASTS ==========

export const TIME_BASED_ROASTS: Record<string, string[]> = {
  morning: [
    "You're up early. Or late. Either way, I'm judging.",
    "Morning! Your productivity is... optimistic.",
    "Early bird or night owl? Either way, you're here.",
    "Good morning! Time to be productive. (That was a suggestion.)",
  ],
  afternoon: [
    "Lunch break? More like procrastination break.",
    "Afternoon slump? I can see it in your workflow.",
    "It's afternoon. Your energy is... declining.",
    "Post-lunch productivity: 📉",
  ],
  evening: [
    "Still here? Your work-life balance is... interesting.",
    "Evening work? That's dedication. Or poor planning.",
    "It's evening. Shouldn't you be done by now?",
    "Late night work? I'm judging your life choices.",
  ],
  night: [
    "It's late. Go to bed. Your productivity tomorrow will thank you.",
    "Night shift? Or just poor time management?",
    "It's {hour} PM. Your sleep schedule is... creative.",
    "Working at night? I'm concerned about your health.",
  ],
}

export function getTimeBasedRoast(): string {
  const hour = new Date().getHours()
  let timeOfDay: string
  
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon'
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening'
  } else {
    timeOfDay = 'night'
  }
  
  const roasts = TIME_BASED_ROASTS[timeOfDay] || TIME_BASED_ROASTS.evening
  const roast = roasts[Math.floor(Math.random() * roasts.length)]
  return roast.replace('{hour}', hour.toString())
}

// ========== FEATURE 13: COMPARISON ROASTS ==========

export const COMPARISON_ROASTS = [
  "You've been on this page longer than your last relationship.",
  "Your productivity is lower than my battery percentage.",
  "You've checked notifications more than a teenager checks Instagram.",
  "Your workflow is slower than dial-up internet.",
  "You've opened more windows than a house has.",
  "Your efficiency is inversely proportional to your confidence.",
  "You've been idle longer than a parked car.",
  "Your mouse has traveled more miles than you have today.",
  "You've made more mistakes than a toddler learning to walk.",
  "Your desktop is more cluttered than a hoarder's house.",
  "You've clicked more times than a clickbait article.",
  "Your work pace is slower than a sloth on sedatives.",
  "You've procrastinated more than a college student during finals.",
  "Your organization skills are worse than a tornado aftermath.",
  "You've been here longer than a bad movie.",
]

export function getComparisonRoast(): string {
  return COMPARISON_ROASTS[Math.floor(Math.random() * COMPARISON_ROASTS.length)]
}

// ========== NEW FEATURES: WEATHER, JOKES, QUOTES, PRODUCTIVITY TIPS ==========

export const BUDDY_JOKES = [
  "Why did the developer go broke? Because he used up all his cache! 💰",
  "How do you comfort a JavaScript bug? You console it! 🐛",
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "What's a programmer's favorite hangout? Foo Bar! 🍺",
  "Why don't programmers like nature? It has too many bugs! 🌳",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
  "Why did the programmer quit his job? He didn't get arrays! 📊",
  "What's the object-oriented way to become wealthy? Inheritance! 💰",
  "Why do Java developers wear glasses? Because they can't C#! 👓",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?' 🍻",
]

export function getJoke(): string {
  return BUDDY_JOKES[Math.floor(Math.random() * BUDDY_JOKES.length)]
}

export const BUDDY_QUOTES = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "It's not about ideas. It's about making ideas happen. - Scott Belsky",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
]

export function getQuote(): string {
  return BUDDY_QUOTES[Math.floor(Math.random() * BUDDY_QUOTES.length)]
}

export const PRODUCTIVITY_TIPS = [
  "💡 Try the Pomodoro Technique: 25 minutes of focused work, then a 5-minute break!",
  "📝 Break large tasks into smaller, manageable chunks. Progress feels good!",
  "🎯 Set specific, achievable goals for today. You've got this!",
  "⏰ Time-block your calendar. Schedule your work like important meetings!",
  "🚫 Eliminate distractions. Close unnecessary tabs and silence notifications!",
  "✅ Start with your hardest task when your energy is highest!",
  "🔄 Take regular breaks. Your brain needs rest to stay sharp!",
  "📊 Track your time to see where it actually goes. Knowledge is power!",
  "🎵 Use focus music or white noise to maintain concentration!",
  "🏆 Celebrate small wins. Every completed task is progress!",
]

export function getProductivityTip(): string {
  return PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)]
}

export const DAILY_CHALLENGES = [
  { challenge: "Complete 3 tasks before lunch", reward: "A sense of accomplishment! 🏆" },
  { challenge: "Take 5-minute breaks every hour", reward: "Better focus and less burnout! 💪" },
  { challenge: "Close 5 browser tabs you don't need", reward: "A cleaner workspace! 🧹" },
  { challenge: "Reply to 3 pending messages", reward: "Clearer communication! 📧" },
  { challenge: "Organize your desktop icons", reward: "A more organized mind! 📁" },
  { challenge: "Learn one new keyboard shortcut", reward: "Faster workflow! ⚡" },
  { challenge: "Write down 3 goals for tomorrow", reward: "Better planning! 📋" },
  { challenge: "Complete one task you've been avoiding", reward: "Relief and progress! ✅" },
]

export function getDailyChallenge(): { challenge: string; reward: string } {
  return DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)]
}

// Simple weather function (mock - would integrate with real API)
export function getWeather(): string {
  const conditions = ['sunny', 'cloudy', 'rainy', 'windy']
  const temps = [65, 72, 68, 75, 70]
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  const temp = temps[Math.floor(Math.random() * temps.length)]
  const emoji = condition === 'sunny' ? '☀️' : condition === 'cloudy' ? '☁️' : condition === 'rainy' ? '🌧️' : '💨'
  return `${emoji} It's ${condition} and ${temp}°F outside. Perfect weather for... staying inside and working! 😏`
}

// Command handler
export function handleBuddyCommand(command: string): string | null {
  const cmd = command.toLowerCase().trim()
  
  if (cmd.includes('weather') || cmd.includes('temp')) {
    return getWeather()
  }
  
  if (cmd.includes('joke') || cmd.includes('funny')) {
    return getJoke()
  }
  
  if (cmd.includes('quote') || cmd.includes('inspire')) {
    return getQuote()
  }
  
  if (cmd.includes('tip') || cmd.includes('productivity') || cmd.includes('help')) {
    return getProductivityTip()
  }
  
  if (cmd.includes('challenge') || cmd.includes('goal')) {
    const challenge = getDailyChallenge()
    return `🎯 Today's Challenge: ${challenge.challenge}\n\nReward: ${challenge.reward}`
  }
  
  return null
}
