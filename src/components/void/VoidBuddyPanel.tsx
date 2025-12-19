import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { sanitizeString } from '@/lib/void/validation'
import { getRockPaperScissorsResult, PRODUCTIVITY_QUIZ_QUESTIONS, type MiniGameType } from '@/lib/void/buddyPersonality'
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

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Mini Games Section */}
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

        {/* Messages Section - Always Visible */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            💬 MESSAGES
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {buddyMessages.length > 0 ? (
              buddyMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className="void-body-small p-2 rounded cursor-pointer transition-all hover:scale-105"
                  style={{
                    color: 'var(--text-primary, var(--void-text-primary))',
                    background: 'var(--surface-hover, var(--void-surface-hover))',
                    borderRadius: 'var(--radius-sm, 8px)',
                  }}
                  onClick={() => onMessageClick?.(msg.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Click me for a response! 😏"
                >
                  {sanitizeString(msg.message, 200)}
                </motion.div>
              ))
            ) : (
              <div 
                className="void-body-small p-2 rounded"
                style={{
                  color: 'var(--text-primary, var(--void-text-primary))',
                  background: 'var(--surface-hover, var(--void-surface-hover))',
                  borderRadius: 'var(--radius-sm, 8px)',
                }}
              >
                {`Morning ${sanitizeString(userName, 100)}! ${streak ? `Streak: ${streak.current} days 🔥` : 'Welcome back!'}`}
              </div>
            )}
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

        {/* Suggested Actions */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            ⚡ SUGGESTED ACTIONS
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => {
                onMessageClick?.('action-draft-email')
              }}
            >
              Draft Email
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => {
                onMessageClick?.('action-schedule')
              }}
            >
              Schedule
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => {
                onMessageClick?.('action-snooze')
              }}
            >
              Snooze
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
