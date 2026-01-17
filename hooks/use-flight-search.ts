"use client"

import { useState, useCallback, useMemo } from "react"
import type { Flight, SearchParams, FilterState, FlightSearchResponse } from "@/types/flight"
import { filterFlights, getUniqueAirlines, getPriceRange } from "@/utils/flight-utils"

interface UseFlightSearchReturn {
  // State
  flights: Flight[]
  filteredFlights: Flight[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  searchParams: SearchParams | null
  dataSource: "aviationstack" | null

  // Filter state
  filters: FilterState
  availableAirlines: string[]
  priceRange: { min: number; max: number }

  // Actions
  search: (params: SearchParams) => Promise<void>
  updateFilters: (updates: Partial<FilterState>) => void
  resetFilters: () => void
  clearSearch: () => void
}

const initialFilters: FilterState = {
  maxPrice: 10000,
  stops: [],
  airlines: [],
}

export const useFlightSearch = (): UseFlightSearchReturn => {
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [dataSource, setDataSource] = useState<"aviationstack" | null>(null)

  // Derived state - using useMemo for performance
  const priceRange = useMemo(() => getPriceRange(flights), [flights])

  const availableAirlines = useMemo(() => getUniqueAirlines(flights), [flights])

  // Memoized filtered flights - key requirement
  const filteredFlights = useMemo(() => filterFlights(flights, filters), [flights, filters])

  const search = useCallback(async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)
    setSearchParams(params)
    setDataSource(null)

    try {
      // Build API URL with search params
      const url = new URL("/api/flights", window.location.origin)
      url.searchParams.append("origin", params.origin.code)
      url.searchParams.append("destination", params.destination.code)
      url.searchParams.append("date", params.departureDate)

      const response = await fetch(url.toString())
      const data: FlightSearchResponse = await response.json()

      // Check for error in response body first (more specific error message)
      if (data.error) {
        setError(data.error)
        setFlights([])
        setHasSearched(true)
        return
      }

      // If no error in body but response not ok, use status code
      if (!response.ok) {
        setError(data.error || `Search failed: ${response.status}`)
        setFlights([])
        setHasSearched(true)
        return
      }

      // Success - set flights
      setFlights(data.flights)
      setDataSource(data.source)
      setHasSearched(true)

      // Reset filters but set max price based on results
      const range = getPriceRange(data.flights)
      setFilters({
        ...initialFilters,
        maxPrice: range.max,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setFlights([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update filters
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters({
      ...initialFilters,
      maxPrice: priceRange.max,
    })
  }, [priceRange.max])

  // Clear search completely
  const clearSearch = useCallback(() => {
    setFlights([])
    setHasSearched(false)
    setSearchParams(null)
    setFilters(initialFilters)
    setError(null)
    setDataSource(null)
  }, [])

  return {
    flights,
    filteredFlights,
    isLoading,
    error,
    hasSearched,
    searchParams,
    filters,
    availableAirlines,
    priceRange,
    dataSource,
    search,
    updateFilters,
    resetFilters,
    clearSearch,
  }
}
