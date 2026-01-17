// Core flight types matching Amadeus API structure

export interface Airport {
  code: string
  name: string
  city: string
}

export interface Flight {
  id: string
  airline: string
  airlineCode: string
  flightNumber: string
  origin: Airport
  destination: Airport
  departureTime: string // ISO datetime
  arrivalTime: string // ISO datetime
  duration: number // minutes
  stops: number
  price: number
  currency: string
  seatsAvailable: number
  aircraft?: string
  cabin?: string
}

// Keep FlightOffer as alias for backwards compatibility
export type FlightOffer = Flight

export interface SearchParams {
  origin: Airport
  destination: Airport
  departureDate: string
  returnDate?: string
  passengers: number
}

export interface FilterState {
  maxPrice: number
  stops: number[] // Empty means all, otherwise [0], [1], [2] etc.
  airlines: string[] // Empty means all
}

// Price data point for chart
export interface PriceDataPoint {
  airline: string
  price: number
  stops: number
  id: string
}

// API Response type
export interface FlightSearchResponse {
  flights: Flight[]
  source: "aviationstack"
  error?: string
}
