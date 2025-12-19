import { useVoidBackground } from '@/hooks/useVoidBackground'
import { useVoidStore } from '@/lib/void/store'

export function Background() {
  const { background } = useVoidStore()

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Custom background */}
      {background.type === 'video' && background.url ? (
        <video
          src={background.url}
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
          style={{
            filter: `brightness(${background.brightness}) contrast(${background.contrast})`,
          }}
        />
      ) : background.type === 'image' && background.url ? (
        <img
          src={background.url}
          alt="Custom background"
          className="object-cover w-full h-full"
          style={{
            filter: `brightness(${background.brightness}) contrast(${background.contrast})`,
          }}
          loading="eager"
        />
      ) : background.type === 'shader' && background.shader ? (
        <canvas
          className="w-full h-full"
          // Shader rendering will be implemented separately
        />
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-[var(--void-bg)] via-[var(--void-surface)] to-[var(--void-bg)]"
        />
      )}

      {/* Adaptive overlay */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          backgroundColor: 'var(--void-bg)',
          opacity: background.overlayOpacity,
        }}
      />
    </div>
  )
}
