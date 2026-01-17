import type { Flight, FilterState, PriceDataPoint } from "@/types/flight"
import { airlineDictionary } from "@/data/dummy-flights"

/**
 * Format duration from minutes to human readable
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  if (mins) return `${mins}m`
  return "0m"
}

/**
 * Format time from ISO datetime string
 */
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Format date from ISO datetime string
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/**
 * Get human readable stops text
 */
export const getStopsText = (stops: number): string => {
  if (stops === 0) return "Nonstop"
  if (stops === 1) return "1 stop"
  return `${stops} stops`
}

/**
 * Get airline name from code
 */
export const getAirlineName = (code: string): string => {
  return airlineDictionary[code] || code
}

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Get unique airlines from flight list
 */
export const getUniqueAirlines = (flights: Flight[]): string[] => {
  const airlines = new Set<string>()
  flights.forEach((flight) => {
    airlines.add(flight.airlineCode)
  })
  return Array.from(airlines).sort()
}

/**
 * Get price range from flights
 */
export const getPriceRange = (flights: Flight[]): { min: number; max: number } => {
  if (flights.length === 0) return { min: 0, max: 1000 }

  const prices = flights.map((f) => f.price)
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  }
}

/**
 * Filter flights based on filter state
 * Pure function - does not mutate input
 */
export const filterFlights = (flights: Flight[], filters: FilterState): Flight[] => {
  return flights.filter((flight) => {
    // Price filter
    if (flight.price > filters.maxPrice) return false

    // Stops filter (empty array means all)
    if (filters.stops.length > 0) {
      // Handle 2+ stops case
      const matchesStops = filters.stops.some((s) => (s === 2 ? flight.stops >= 2 : flight.stops === s))
      if (!matchesStops) return false
    }

    // Airline filter (empty array means all)
    if (filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.airlineCode)) return false
    }

    return true
  })
}

/**
 * Transform flights to chart data points
 */
export const transformToChartData = (flights: Flight[]): PriceDataPoint[] => {
  return flights.map((flight) => ({
    id: flight.id,
    airline: flight.airline,
    price: flight.price,
    stops: flight.stops,
  }))
}

/**
 * Get price statistics from flights
 */
export const getPriceStats = (flights: Flight[]): { avg: number; min: number; max: number; median: number } => {
  if (flights.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0 }
  }

  const prices = flights.map((f) => f.price).sort((a, b) => a - b)
  const sum = prices.reduce((acc, p) => acc + p, 0)
  const mid = Math.floor(prices.length / 2)

  return {
    avg: Math.round(sum / prices.length),
    min: Math.round(prices[0]),
    max: Math.round(prices[prices.length - 1]),
    median: Math.round(prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2),
  }
}
