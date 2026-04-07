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
  // Parallel array to suggestions — same index, same order
  const matchedRecordsRef = useRef<ThaiAddressRecord[]>([])

  const setQuery = useCallback((value: string) => {
    setQueryState(value)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (query.length === 0) {
      setSuggestions([])
      matchedRecordsRef.current = []
      return
    }

    timerRef.current = setTimeout(() => {
      const records = searchThaiAddress(index, query, { limit, threshold })
      matchedRecordsRef.current = records
      setSuggestions(records.map(formatThaiAddressSuggestion))
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, index, limit, threshold, debounceMs])

  const selectSuggestion = useCallback(
    (item: ThaiAddressSuggestion): ResolvedThaiAddress => {
      // O(1) lookup via parallel array — same index as suggestions array
      const idx = matchedRecordsRef.current.findIndex(r => String(r.tambonId) === item.id)
      const record = matchedRecordsRef.current[idx]
      if (!record) {
        throw new Error(`[thaizip] No record found for suggestion id "${item.id}". Make sure to use suggestions returned by this hook.`)
      }
      setSuggestions([])
      matchedRecordsRef.current = []
      return resolveThaiAddress(record)
    },
    [],
  )

  const clear = useCallback(() => {
    setQueryState('')
    setSuggestions([])
    matchedRecordsRef.current = []
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
