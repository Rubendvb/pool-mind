'use client'
import { useState } from 'react'
import { maskBRL, parseBRL, numberToMaskDigits } from '@/lib/currency'

interface Props {
  name: string
  defaultValue?: number | null
  placeholder?: string
  className?: string
}

function getInitialDisplay(value: number | null | undefined): string {
  if (value == null || value === 0) return ''
  const digits = numberToMaskDigits(value)
  return parseInt(digits, 10) > 0 ? maskBRL(digits) : ''
}

export function CurrencyInput({
  name,
  defaultValue,
  placeholder = '0,00',
  className = '',
}: Props) {
  const [display, setDisplay] = useState(() => getInitialDisplay(defaultValue))

  // Hidden input stores the plain numeric string for server action parsing.
  const numericValue = display ? String(parseBRL(display)) : ''

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10)
    // Clear when empty or zero so backspace can fully clear the field.
    setDisplay(!raw || num === 0 ? '' : maskBRL(raw))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/50 pointer-events-none select-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} pl-9 w-full`}
      />
      <input type="hidden" name={name} value={numericValue} />
    </div>
  )
}
