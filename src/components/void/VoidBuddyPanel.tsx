import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { sanitizeString } from '@/lib/void/validation'
import { getRockPaperScissorsResult, PRODUCTIVITY_QUIZ_QUESTIONS, handleBuddyCommand, type MiniGameType } from '@/lib/void/buddyPersonality'
import type { BuddyState } from '@/lib/void/types'

interface VoidBuddyPanelProps {
  onClose?: () => void
  userName: string
  onMessageClick?: (messageId: string) => void
  stats?: BuddyState['stats']
  streak?: BuddyState['streak']
  mood?: BuddyState['mood']
  miniGame?: MiniGameType
  onStartMiniGame?: (gameType: MiniGameType) => void
  onCloseMiniGame?: () => void
}

// Format timestamp for iPhone-style messages
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function VoidBuddyPanel({ 
  userName, 
  onMessageClick, 
  stats,
  streak,
  mood = 'sassy',
  miniGame,
  onStartMiniGame,
  onCloseMiniGame,
}: VoidBuddyPanelProps) {
  const { buddyMessages, addBuddyMessage } = useVoidStore()
  const [rpsChoice, setRpsChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null)
  const [quizQuestion, setQuizQuestion] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [guessNumber, setGuessNumber] = useState<number | null>(null)
  const [guessInput, setGuessInput] = useState('')
  const [guessResult, setGuessResult] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [buddyMessages])

  return (
    <motion.div
      className="glass-panel overflow-hidden flex flex-col"
      style={{
        width: '360px',
        height: '480px',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: 'var(--shadow-ambient)',
        willChange: 'transform',
      }}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        duration: 0.2,
      }}
    >
      {/* Header */}
      <div 
        className="h-12 px-4 border-b flex items-center justify-center"
        style={{
          background: 'var(--surface-hover, var(--void-surface-hover))',
          borderColor: 'var(--border, var(--void-border))',
        }}
      >
        <div className="flex items-center justify-between w-full">
          <span 
            className="void-heading-3"
            style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
          >
            Buddy
          </span>
          {mood && (
            <span 
              className="void-body-caption text-xs px-2 py-1 rounded"
              style={{
                background: mood === 'annoyed' ? 'var(--error)' : mood === 'proud' ? 'var(--success)' : 'var(--accent)',
                color: 'white',
              }}
            >
              {mood.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content - Scrollable area for messages */}
      <div className="flex-1 flex flex-col min-h-0" style={{ overflow: 'hidden' }}>
        {/* Mini Games Section - Show above messages if active */}
        {miniGame && (
          <div className="mb-4 p-3 rounded border" style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="void-body-caption uppercase">🎮 {miniGame === 'guess-number' ? 'Guess Number' : miniGame === 'rock-paper-scissors' ? 'Rock Paper Scissors' : 'Productivity Quiz'}</h3>
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onCloseMiniGame}>✕</Button>
            </div>
            
            <AnimatePresence mode="wait">
              {miniGame === 'rock-paper-scissors' && (
                <motion.div
                  key="rps"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {!rpsChoice ? (
                    <div className="flex gap-2">
                      {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                        <Button
                          key={choice}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 flex-1"
                          onClick={() => {
                            setRpsChoice(choice)
                            const result = getRockPaperScissorsResult(choice)
                            addBuddyMessage({
                              id: `buddy-rps-${Date.now()}`,
                              message: `You chose ${choice}, I chose ${result.aiChoice}. ${result.message}`,
                              emotion: result.result === 'lose' ? 'happy' : 'thinking',
                              timestamp: Date.now(),
                              priority: 'low',
                            })
                            setTimeout(() => {
                              setRpsChoice(null)
                            }, 2000)
                          }}
                        >
                          {choice.charAt(0).toUpperCase() + choice.slice(1)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="void-body-small text-center">Choose your weapon!</div>
                  )}
                </motion.div>
              )}
              
              {miniGame === 'guess-number' && (
                <motion.div
                  key="guess"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {guessNumber === null && (
                    <>
                      <div className="void-body-small mb-2">I'm thinking of a number 1-100. Guess it!</div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={guessInput}
                          onChange={(e) => setGuessInput(e.target.value)}
                          className="flex-1 px-2 py-1 rounded text-sm"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && guessInput) {
                              const num = parseInt(guessInput)
                              const target = Math.floor(Math.random() * 100) + 1
                              setGuessNumber(target)
                              if (num === target) {
                                setGuessResult("You got it! Lucky guess...")
                                addBuddyMessage({
                                  id: `buddy-guess-${Date.now()}`,
                                  message: "You guessed it! That was... lucky.",
                                  emotion: 'happy',
                                  timestamp: Date.now(),
                                  priority: 'low',
                                })
                              } else {
                                setGuessResult(`Nope! It was ${target}. Better luck next time!`)
                                addBuddyMessage({
                                  id: `buddy-guess-${Date.now()}`,
                                  message: `Wrong! It was ${target}. I'm always right.`,
                                  emotion: 'happy',
                                  timestamp: Date.now(),
                                  priority: 'low',
                                })
                              }
                              setTimeout(() => {
                                setGuessNumber(null)
                                setGuessInput('')
                                setGuessResult(null)
                              }, 3000)
                            }
                          }}
                        />
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => {
                          if (guessInput) {
                            const num = parseInt(guessInput)
                            const target = Math.floor(Math.random() * 100) + 1
                            setGuessNumber(target)
                            if (num === target) {
                              setGuessResult("You got it! Lucky guess...")
                            } else {
                              setGuessResult(`Nope! It was ${target}. Better luck next time!`)
                            }
                            setTimeout(() => {
                              setGuessNumber(null)
                              setGuessInput('')
                              setGuessResult(null)
                            }, 3000)
                          }
                        }}>
                          Guess
                        </Button>
                      </div>
                    </>
                  )}
                  {guessResult && (
                    <div className="void-body-small text-center">{guessResult}</div>
                  )}
                </motion.div>
              )}
              
              {miniGame === 'productivity-quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {quizQuestion < PRODUCTIVITY_QUIZ_QUESTIONS.length ? (
                    <>
                      <div className="void-body-small font-semibold mb-2">
                        {PRODUCTIVITY_QUIZ_QUESTIONS[quizQuestion].question}
                      </div>
                      <div className="space-y-1">
                        {PRODUCTIVITY_QUIZ_QUESTIONS[quizQuestion].options.map((option, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 w-full justify-start"
                            onClick={() => {
                              if (idx === PRODUCTIVITY_QUIZ_QUESTIONS[quizQuestion].correct) {
                                setQuizScore(quizScore + 1)
                                addBuddyMessage({
                                  id: `buddy-quiz-${Date.now()}`,
                                  message: "Correct! But you still need work.",
                                  emotion: 'happy',
                                  timestamp: Date.now(),
                                  priority: 'low',
                                })
                              } else {
                                addBuddyMessage({
                                  id: `buddy-quiz-${Date.now()}`,
                                  message: PRODUCTIVITY_QUIZ_QUESTIONS[quizQuestion].roast,
                                  emotion: 'thinking',
                                  timestamp: Date.now(),
                                  priority: 'low',
                                })
                              }
                              if (quizQuestion < PRODUCTIVITY_QUIZ_QUESTIONS.length - 1) {
                                setQuizQuestion(quizQuestion + 1)
                              } else {
                                addBuddyMessage({
                                  id: `buddy-quiz-final-${Date.now()}`,
                                  message: `Quiz complete! Score: ${quizScore + (idx === PRODUCTIVITY_QUIZ_QUESTIONS[quizQuestion].correct ? 1 : 0)}/${PRODUCTIVITY_QUIZ_QUESTIONS.length}. ${quizScore >= 2 ? "Not bad!" : "You need to study more."}`,
                                  emotion: quizScore >= 2 ? 'happy' : 'thinking',
                                  timestamp: Date.now(),
                                  priority: 'medium',
                                })
                                setTimeout(() => {
                                  setQuizQuestion(0)
                                  setQuizScore(0)
                                  onCloseMiniGame?.()
                                }, 2000)
                              }
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Stats Section */}
        {stats && (
          <div>
            <h3 
              className="void-body-caption mb-2 uppercase tracking-wide"
              style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
            >
              📊 STATS
            </h3>
            <div 
              className="space-y-1 void-body-small p-2 rounded"
              style={{
                background: 'var(--surface-hover, var(--void-surface-hover))',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              <div>Windows: {stats.windowsOpened} opened, {stats.windowsClosed} closed</div>
              <div>Clicks: {stats.totalClicks}</div>
              <div>Idle: {Math.floor(stats.idleMinutes)} min</div>
              <div>Errors: {stats.errors}</div>
              {streak && <div>Streak: {streak.current} days 🔥</div>}
            </div>
          </div>
        )}

        {/* Messages Section - iPhone Style */}
        <div className="flex-1 flex flex-col min-h-0">
          <div 
            className="flex-1 overflow-y-auto px-2 py-4 space-y-2"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              background: 'linear-gradient(to bottom, #E5E5EA 0%, #F2F2F7 100%)',
            }}
          >
            {buddyMessages.length > 0 ? (
              <AnimatePresence initial={false}>
                {buddyMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-start gap-2"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {/* Avatar/Buddy indicator */}
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)',
                        color: '#000',
                      }}
                    >
                      B
                    </div>
                    
                    {/* Message bubble */}
                    <div className="flex flex-col items-start max-w-[75%]">
                      <motion.div
                        className="px-4 py-2 rounded-2xl cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                          color: '#fff',
                          borderRadius: '18px 18px 18px 4px', // iOS left bubble style
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={() => onMessageClick?.(msg.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Click me for a response! 😏"
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {sanitizeString(msg.message, 200)}
                        </div>
                      </motion.div>
                      
                      {/* Timestamp */}
                      <div 
                        className="text-xs mt-1 px-2"
                        style={{ color: 'var(--text-tertiary, var(--void-text-muted))' }}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)',
                    color: '#000',
                  }}
                >
                  B
                </div>
                <div className="flex flex-col items-start max-w-[75%]">
                  <div
                    className="px-4 py-2 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                      color: '#fff',
                      borderRadius: '18px 18px 18px 4px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="text-sm leading-relaxed">
                      {`Morning ${sanitizeString(userName, 100)}! ${streak ? `Streak: ${streak.current} days 🔥` : 'Welcome back!'}`}
                    </div>
                  </div>
                  <div 
                    className="text-xs mt-1 px-2"
                    style={{ color: 'var(--text-tertiary, var(--void-text-muted))' }}
                  >
                    now
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Priorities */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            📋 PRIORITIES
          </h3>
          <div className="space-y-2">
            <div 
              className="void-body-small p-2 rounded"
              style={{
                color: 'var(--text-primary, var(--void-text-primary))',
                background: 'var(--surface-hover, var(--void-surface-hover))',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              ○ Sarah Miller (no response 48h)
            </div>
            <div 
              className="void-body-small p-2 rounded"
              style={{
                color: 'var(--text-primary, var(--void-text-primary))',
                background: 'var(--surface-hover, var(--void-surface-hover))',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              ○ Johnson quote (due 3pm)
            </div>
          </div>
        </div>

        {/* Mini Games */}
        {!miniGame && (
          <div>
            <h3 
              className="void-body-caption mb-2 uppercase tracking-wide"
              style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
            >
              🎮 MINI GAMES
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={() => onStartMiniGame?.('guess-number')}
              >
                Guess Number
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={() => onStartMiniGame?.('rock-paper-scissors')}
              >
                RPS
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={() => onStartMiniGame?.('productivity-quiz')}
              >
                Quiz
              </Button>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide text-xs"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            💬 Quick Commands
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2"
              onClick={() => {
                const response = handleBuddyCommand('weather')
                if (response) {
                  addBuddyMessage({
                    id: `buddy-weather-${Date.now()}`,
                    message: response,
                    emotion: 'neutral',
                    timestamp: Date.now(),
                    priority: 'low',
                  })
                }
              }}
            >
              🌤️ Weather
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2"
              onClick={() => {
                const response = handleBuddyCommand('joke')
                if (response) {
                  addBuddyMessage({
                    id: `buddy-joke-${Date.now()}`,
                    message: response,
                    emotion: 'happy',
                    timestamp: Date.now(),
                    priority: 'low',
                  })
                }
              }}
            >
              😂 Joke
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2"
              onClick={() => {
                const response = handleBuddyCommand('quote')
                if (response) {
                  addBuddyMessage({
                    id: `buddy-quote-${Date.now()}`,
                    message: response,
                    emotion: 'thinking',
                    timestamp: Date.now(),
                    priority: 'low',
                  })
                }
              }}
            >
              💭 Quote
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2"
              onClick={() => {
                const response = handleBuddyCommand('tip')
                if (response) {
                  addBuddyMessage({
                    id: `buddy-tip-${Date.now()}`,
                    message: response,
                    emotion: 'excited',
                    timestamp: Date.now(),
                    priority: 'medium',
                  })
                }
              }}
            >
              💡 Tip
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2"
              onClick={() => {
                const response = handleBuddyCommand('challenge')
                if (response) {
                  addBuddyMessage({
                    id: `buddy-challenge-${Date.now()}`,
                    message: response,
                    emotion: 'excited',
                    timestamp: Date.now(),
                    priority: 'medium',
                  })
                }
              }}
            >
              🎯 Challenge
            </Button>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            🏆 INSIGHTS
          </h3>
          <div 
            className="space-y-1 void-body-small"
            style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
          >
            <div>• $18k this week (+15% WoW)</div>
            <div>• Avg call: 7min (efficiency +25%)</div>
          </div>
        </div>

        {/* Soundscape */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            🎵 SOUNDSCAPE
          </h3>
          <div 
            className="void-body-small"
            style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
          >
            Rain + Lo-fi
          </div>
        </div>
      </div>
    </motion.div>
  )
}
