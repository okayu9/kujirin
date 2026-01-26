import { useRef, useCallback } from 'react'
import type { ValidationError } from '../lib/validation'

interface ListInputProps {
  label: string
  icon?: string
  value: string
  onChange: (value: string) => void
  errors: ValidationError[]
  duplicateIndices: Set<number>
  placeholder?: string
}

export function ListInput({
  label,
  icon,
  value,
  onChange,
  errors,
  duplicateIndices,
  placeholder,
}: ListInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lines = value.split('\n')
  const lineCount = Math.max(lines.length, 1)
  const errorLineSet = new Set(errors.filter((e) => e.line).map((e) => e.line!))

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 font-bold text-gray-700">
        {icon && <span className="text-lg">{icon}</span>}
        {label}
      </label>
      <div className="flex border-2 border-amber-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 bg-white shadow-sm">
        <div
          ref={lineNumbersRef}
          className="bg-amber-50 text-amber-400 text-right px-3 py-3 select-none overflow-hidden font-mono text-sm leading-6"
          style={{ minWidth: '2.5rem' }}
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1
            const hasError = errorLineSet.has(lineNum)
            const isDuplicate = duplicateIndices.has(i)
            return (
              <div
                key={i}
                className={
                  hasError || isDuplicate ? 'text-red-500 font-bold' : ''
                }
              >
                {lineNum}
              </div>
            )
          })}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          placeholder={placeholder}
          className="flex-1 p-3 resize-none outline-none font-mono text-sm leading-6 min-h-[150px] placeholder:text-gray-300"
          rows={6}
        />
      </div>
      {errors.length > 0 && (
        <ul className="text-red-500 text-sm space-y-1 bg-red-50 rounded-lg p-3">
          {errors.map((error, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>
                {error.line ? `${error.line}行目: ` : ''}
                {error.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
