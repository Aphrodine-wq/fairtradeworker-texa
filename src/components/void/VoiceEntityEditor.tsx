import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, X } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ExtractedEntities, ExtractedEntity } from '@/lib/void/types'
import '@/styles/void-voice.css'

interface VoiceEntityEditorProps {
  entities: ExtractedEntities
  onSave: (entities: ExtractedEntities) => void
  onCancel: () => void
  onAddMore: () => void
}

export function VoiceEntityEditor({ entities, onSave, onCancel, onAddMore }: VoiceEntityEditorProps) {
  const [editedEntities, setEditedEntities] = useState<ExtractedEntities>(entities)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.9) return 'high-confidence'
    if (confidence >= 0.7) return 'medium-confidence'
    return 'low-confidence'
  }

  const getConfidenceBadgeClass = (confidence: number) => {
    if (confidence >= 0.9) return 'high'
    if (confidence >= 0.7) return 'medium'
    return 'low'
  }

  const handleEdit = (field: string, currentValue: string | number | null) => {
    setEditingField(field)
    setEditValue(String(currentValue || ''))
  }

  const handleSaveEdit = (field: keyof ExtractedEntities) => {
    setEditedEntities({
      ...editedEntities,
      [field]: {
        ...editedEntities[field]!,
        value: editValue,
        confidence: 1.0, // User-edited, so confidence is 100%
      },
    })
    setEditingField(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleAlternativeSelect = (field: keyof ExtractedEntities, alternative: string) => {
    setEditedEntities({
      ...editedEntities,
      [field]: {
        ...editedEntities[field]!,
        value: alternative,
        confidence: 0.85, // Slightly lower than original
      },
    })
  }

  const renderField = (
    label: string,
    field: keyof ExtractedEntities,
    entity: ExtractedEntity | undefined
  ) => {
    if (!entity) return null

    const isEditing = editingField === field
    const confidence = entity.confidence || 0
    const hasAlternatives = entity.alternatives && entity.alternatives.length > 0

    return (
      <div
        key={field}
        className={cn(
          'void-entity-field',
          getConfidenceClass(confidence)
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[var(--void-text)] capitalize">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <span className={cn('void-confidence-badge', getConfidenceBadgeClass(confidence))}>
              {Math.round(confidence * 100)}%
            </span>
            {!isEditing && (
              <button
                onClick={() => handleEdit(field, entity.value)}
                className="p-1 hover:bg-[var(--void-surface-hover)] rounded transition-colors"
                aria-label="Edit"
              >
                <Pencil className="w-3 h-3 text-[var(--void-text-muted)]" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => handleSaveEdit(field)}
              className="px-2"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              className="px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--void-text)] flex-1">
              {entity.value !== null && entity.value !== undefined ? String(entity.value) : 'Not detected'}
            </span>
            {hasAlternatives && confidence < 0.85 && (
              <Select
                value={String(entity.value || '')}
                onValueChange={(value) => handleAlternativeSelect(field, value)}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Alternatives..." />
                </SelectTrigger>
                <SelectContent>
                  {entity.alternatives?.map((alt, i) => (
                    <SelectItem key={i} value={alt}>
                      {alt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {entity.notes && (
          <p className="text-xs text-[var(--void-text-muted)] mt-1">{entity.notes}</p>
        )}
      </div>
    )
  }

  const requiredFields = ['name', 'phone', 'email', 'project'] as const
  const validation = requiredFields.map((field) => {
    const entity = editedEntities[field]
    return {
      field,
      isValid: entity?.value && entity.confidence >= 0.7,
    }
  })

  const allValid = validation.every((v) => v.isValid)

  return (
    <motion.div
      className="void-voice-dialog"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[var(--void-text)] mb-4">
          Review & Save
        </h2>

        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
          {renderField('Name', 'name', editedEntities.name)}
          {renderField('Phone', 'phone', editedEntities.phone)}
          {renderField('Email', 'email', editedEntities.email)}
          {renderField('Project', 'project', editedEntities.project)}
          {renderField('Budget', 'budget', editedEntities.budget)}
          {renderField('Urgency', 'urgency', editedEntities.urgency)}
        </div>

        {/* Validation Summary */}
        <div className="mb-6 p-3 bg-[var(--void-surface-hover)] rounded-lg">
          <div className="text-sm font-medium text-[var(--void-text)] mb-2">
            Validation
          </div>
          <div className="space-y-1">
            {validation.map(({ field, isValid }) => (
              <div key={field} className="flex items-center gap-2 text-xs">
                {isValid ? (
                  <span className="text-[var(--void-success)]">✓</span>
                ) : (
                  <span className="text-[var(--void-error)]">✗</span>
                )}
                <span className={cn(
                  'capitalize',
                  isValid ? 'text-[var(--void-text)]' : 'text-[var(--void-text-muted)]'
                )}>
                  {field}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onAddMore}>
            Add More
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(editedEntities)}
            disabled={!allValid}
            className="bg-[var(--void-accent)] text-[var(--void-bg)] disabled:opacity-50"
          >
            Save to Leads
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
