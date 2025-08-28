import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface SuggestionItem {
  label: string
  value: string
}

interface RecipientChipsInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  loadSuggestions?: (query: string) => Promise<SuggestionItem[]> | undefined
}

const splitToTokens = (raw: string): string[] => {
  return raw
    .split(/[;,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

const isLikelyEmail = (s: string): boolean => {
  // Lightweight check; avoid over-restricting valid addresses
  return /@/.test(s)
}

export function RecipientChipsInput({ value, onChange, placeholder, disabled, className, loadSuggestions }: RecipientChipsInputProps) {
  const [tokens, setTokens] = useState<string[]>(() => splitToTokens(value || ''))
  const [input, setInput] = useState<string>('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  // Keep internal tokens in sync when parent value changes externally
  useEffect(() => {
    const next = splitToTokens(value || '')
    if (next.join(',') !== tokens.join(',')) {
      setTokens(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [])

  // Load suggestions with debounce
  useEffect(() => {
    if (!loadSuggestions) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!input || input.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightIndex(-1)
      return
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = (await loadSuggestions(input.trim())) || []
        // Filter out already-added tokens
        const existing = new Set(tokens.map((t) => t.toLowerCase()))
        const filtered = results.filter((r) => !existing.has(r.value.toLowerCase()))
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
        setHighlightIndex(filtered.length > 0 ? 0 : -1)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
        setHighlightIndex(-1)
      }
    }, 200)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [input, loadSuggestions, tokens])

  const emitChange = useCallback(
    (nextTokens: string[]) => {
      const unique = Array.from(new Set(nextTokens.map((t) => t.trim()).filter(Boolean)))
      onChange(unique.join(', '))
    },
    [onChange]
  )

  const addToken = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return
      const pieces = splitToTokens(trimmed)
      const next = [...tokens]
      pieces.forEach((p) => {
        if (p && !next.includes(p)) next.push(p)
      })
      setTokens(next)
      emitChange(next)
      setInput('')
      setShowSuggestions(false)
      setHighlightIndex(-1)
    },
    [tokens, emitChange]
  )

  const selectSuggestion = useCallback((s: SuggestionItem) => {
    addToken(s.value)
  }, [addToken])

  const removeTokenAt = useCallback(
    (index: number) => {
      const next = tokens.filter((_, i) => i !== index)
      setTokens(next)
      emitChange(next)
    },
    [tokens, emitChange]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (showSuggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHighlightIndex((idx) => Math.min(idx + 1, suggestions.length - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHighlightIndex((idx) => Math.max(idx - 1, 0))
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          const s = suggestions[highlightIndex] || suggestions[0]
          if (s) selectSuggestion(s)
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowSuggestions(false)
          return
        }
      }

      if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
        e.preventDefault()
        if (input.trim().length > 0) addToken(input)
        return
      }
      if (e.key === 'Backspace' && input.length === 0 && tokens.length > 0) {
        e.preventDefault()
        removeTokenAt(tokens.length - 1)
        return
      }
    },
    [disabled, input, tokens, addToken, removeTokenAt, showSuggestions, suggestions, highlightIndex, selectSuggestion]
  )

  const inputPlaceholder = useMemo(() => {
    return tokens.length === 0 ? placeholder : undefined
  }, [tokens.length, placeholder])

  return (
    <div className={`relative ${className || ''}`} ref={wrapperRef}>
      <div
        className={`flex flex-wrap items-center gap-1 min-h-9 w-full rounded-md border px-3 py-1.5 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-500 focus-within:border-slate-500 bg-white border-slate-300 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {tokens.map((t, idx) => (
          <span
            key={`${t}-${idx}`}
            className={`flex items-center gap-1 max-w-full rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5`}
            title={t}
          >
            <span className="truncate">
              {isLikelyEmail(t) ? t : t}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTokenAt(idx)
              }}
              className="text-slate-500 hover:text-slate-700"
              aria-label={`Remove ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => {
            // Give time for click on suggestion before blur clears
            setTimeout(() => {
              if (input.trim().length > 0) addToken(input)
              setShowSuggestions(false)
            }, 100)
          }}
          placeholder={inputPlaceholder}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-none outline-none focus:ring-0 bg-transparent text-slate-900 placeholder-slate-400"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-64 overflow-auto py-1 text-sm">
            {suggestions.map((s, i) => (
              <li
                key={`${s.value}-${i}`}
                className={`px-3 py-2 cursor-pointer ${i === highlightIndex ? 'bg-slate-100' : ''}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectSuggestion(s)
                }}
                title={s.value}
              >
                <div className="flex flex-col">
                  <span className="text-slate-900">{s.label}</span>
                  <span className="text-slate-500 text-xs">{s.value}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RecipientChipsInput
