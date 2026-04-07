// NOTE (SZ-4): CJS consumers (`dist/index.cjs`) cannot tree-shake this hook out of the bundle.
// If you are using the CJS build in a non-React environment, import only from the core entry
// or use the ESM build with a bundler that supports tree-shaking.
import { useState, useEffect, useCallback, useRef } from 'react'
import { searchThaiAddress } from '../core/search'
import { formatThaiAddressSuggestion } from '../core/formatter'
import { resolveThaiAddress } from '../core/resolver'
import type {
  UseThaiAddressAutocompleteOptions,
  ThaiAddressRecord,
  ThaiAddressSuggestion,
  ResolvedThaiAddress,
} from '../types'

export function useThaiAddressAutocomplete(options: UseThaiAddressAutocompleteOptions) {
  const { index, limit = 10, debounce: debounceMs = 200, threshold = 0.4 } = options

  const [query, setQueryState] = useState('')
  const [suggestions, setSuggestions] = useState<ThaiAddressSuggestion[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const matchedRecordsMapRef = useRef<Map<string, ThaiAddressRecord>>(new Map())

  const setQuery = useCallback((value: string) => {
    setQueryState(value)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (query.length === 0) {
      setSuggestions([])
      matchedRecordsMapRef.current = new Map()
      return
    }

    timerRef.current = setTimeout(() => {
      const records = searchThaiAddress(index, query, { limit, threshold })
      const formatted = records.map(formatThaiAddressSuggestion)
      const recordMap = new Map<string, ThaiAddressRecord>()
      for (let i = 0; i < records.length; i++) {
        recordMap.set(formatted[i].id, records[i])
      }
      matchedRecordsMapRef.current = recordMap
      setSuggestions(formatted)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, index, limit, threshold, debounceMs])

  /**
   * Resolves a suggestion to a full ThaiAddress and clears the suggestions list.
   *
   * Note: `query` is intentionally left unchanged so the input field retains the
   * typed text. Call `clear()` afterwards if you want to reset the input as well.
   */
  const selectSuggestion = useCallback(
    (item: ThaiAddressSuggestion): ResolvedThaiAddress => {
      const record = matchedRecordsMapRef.current.get(item.id)
      if (!record) {
        throw new Error(`[thaizip] No record found for suggestion id "${item.id}". Make sure to use suggestions returned by this hook.`)
      }
      setSuggestions([])
      matchedRecordsMapRef.current = new Map()
      return resolveThaiAddress(record)
    },
    [],
  )

  const clear = useCallback(() => {
    setQueryState('')
    setSuggestions([])
    matchedRecordsMapRef.current = new Map()
  }, [])

  return {
    query,
    setQuery,
    suggestions,
    isOpen: query.length > 0 && suggestions.length > 0,
    selectSuggestion,
    clear,
  }
}
