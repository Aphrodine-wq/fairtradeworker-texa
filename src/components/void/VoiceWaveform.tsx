import { useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'

interface VoiceWaveformProps {
  isActive: boolean
}

export function VoiceWaveform({ isActive }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Initialize audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioContextRef.current = audioContext

    // Get user media and create analyser
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        source.connect(analyser)
        analyserRef.current = analyser

        // Start animation loop
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const draw = () => {
          if (!isActive || !analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)

          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

          const barWidth = (canvas.width / dpr) / dataArray.length * 2.5
          let x = 0

          for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * (canvas.height / dpr) * 0.8

            const gradient = ctx.createLinearGradient(0, canvas.height / dpr, 0, canvas.height / dpr - barHeight)
            gradient.addColorStop(0, 'var(--void-accent)')
            gradient.addColorStop(1, 'var(--void-accent-alt)')

            ctx.fillStyle = gradient
            ctx.fillRect(x, canvas.height / dpr - barHeight, barWidth, barHeight)

            x += barWidth + 1
          }

          animationFrameRef.current = requestAnimationFrame(draw)
        }

        draw()
      })
      .catch((error) => {
        console.error('Failed to access microphone for waveform:', error)
      })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className="void-waveform"
      style={{ width: '100%', height: '80px' }}
    />
  )
}
