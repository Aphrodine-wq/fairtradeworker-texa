/**
 * Homeowner Photo Annotation
 * Free Feature - Draw on photos to mark issues
 */

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  PencilSimple,
  ArrowCircleRight,
  Circle,
  TextT,
  Eraser
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface PhotoAnnotatorProps {
  user: User
  imageUrl: string
  onSave?: (annotatedImageUrl: string) => void
}

type Tool = 'draw' | 'arrow' | 'circle' | 'text' | 'eraser'

export function PhotoAnnotator({ user, imageUrl, onSave }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('draw')
  const [color, setColor] = useState('#FF0000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    if (tool === 'draw') {
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      setStartPos({ x, y })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = color
    ctx.fillStyle = color

    if (tool === 'arrow') {
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      // Draw arrowhead
      const angle = Math.atan2(y - startPos.y, x - startPos.x)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 15 * Math.cos(angle - Math.PI / 6), y - 15 * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(x, y)
      ctx.lineTo(x - 15 * Math.cos(angle + Math.PI / 6), y - 15 * Math.sin(angle + Math.PI / 6))
      ctx.stroke()
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    setIsDrawing(false)
  }

  const saveAnnotation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const annotatedImageUrl = canvas.toDataURL('image/png')
    if (onSave) {
      onSave(annotatedImageUrl)
    }
    toast.success("Annotation saved!")
  }

  const colors = ['#FF0000', '#FFFF00', '#0000FF', '#00FF00']

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle>Annotate Photo</CardTitle>
        <CardDescription>
          Draw on the photo to mark issues or areas of concern
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tool === 'draw' ? 'default' : 'outline'}
              onClick={() => setTool('draw')}
            >
              <PencilSimple size={16} />
            </Button>
            <Button
              size="sm"
              variant={tool === 'arrow' ? 'default' : 'outline'}
              onClick={() => setTool('arrow')}
            >
              <ArrowCircleRight size={16} />
            </Button>
            <Button
              size="sm"
              variant={tool === 'circle' ? 'default' : 'outline'}
              onClick={() => setTool('circle')}
            >
              <Circle size={16} />
            </Button>
            <Button
              size="sm"
              variant={tool === 'text' ? 'default' : 'outline'}
              onClick={() => setTool('text')}
            >
              <TextT size={16} />
            </Button>
          </div>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-8 h-8 border-2 ${
                  color === c ? 'border-black dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="border-2 border-black dark:border-white overflow-auto max-h-[600px]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="cursor-crosshair"
          />
        </div>

        <Button onClick={saveAnnotation} className="w-full">
          Save Annotated Photo
        </Button>
      </CardContent>
    </Card>
  )
}
