import { memo } from "react"

/**
 * BackgroundBlobs - Blue gradient blob backgrounds for visual depth
 * Adds subtle blue-tinted gradient blobs to the background
 */
export const BackgroundBlobs = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top right blob - blue */}
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/60 to-blue-200/30 rounded-full blur-3xl"
        aria-hidden="true"
      />
      
      {/* Bottom left blob - subtle blue */}
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-50/50 to-indigo-100/30 rounded-full blur-3xl"
        aria-hidden="true"
      />
      
      {/* Center wash */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-50/30 to-transparent rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(239, 246, 255, 0.3) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />
    </div>
  )
})

BackgroundBlobs.displayName = 'BackgroundBlobs'
