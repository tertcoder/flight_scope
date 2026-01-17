/**
 * AviationStack API Client
 *
 * Note: AviationStack free tier has limitations:
 * - Only real-time flight data (no flight search/booking)
 * - Limited to 100 requests/month on free plan
 *
 * For a production flight search engine, I'd want Amadeus or Skyscanner API
 * which support actual flight offers search. We'll transform real flight
 * schedule data into our flight offer format.
 */

import type { Flight, Airport } from "@/types/flight"

const AVIATIONSTACK_BASE_URL = "https://api.aviationstack.com/v1"

// AviationStack API response types
interface AviationStackFlight {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    delay: number | null
    scheduled: string
    estimated: string
    actual: string | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    delay: number | null
    scheduled: string
    estimated: string
    actual: string | null
  }
  airline: {
    name: string
    iata: string
    icao: string
  }
  flight: {
    number: string
    iata: string
    icao: string
  }
}

interface AviationStackResponse {
  pagination: {
    limit: number
    offset: number
    count: number
    total: number
  }
  data: AviationStackFlight[]
}

// Generate realistic price based on flight characteristics
function generatePrice(flight: AviationStackFlight): number {
  const basePrice = 150
  const airlineMultiplier = getAirlineMultiplier(flight.airline.name)
  const timeMultiplier = getTimeMultiplier(flight.departure.scheduled)
  const randomVariance = 0.8 + Math.random() * 0.4 // 80% to 120%

  return Math.round(basePrice * airlineMultiplier * timeMultiplier * randomVariance)
}

function getAirlineMultiplier(airline: string): number {
  const premiumAirlines = ["Emirates", "Qatar Airways", "Singapore Airlines", "Lufthansa", "British Airways"]
  const budgetAirlines = ["Spirit", "Frontier", "Ryanair", "EasyJet", "Southwest"]

  if (premiumAirlines.some((a) => airline.toLowerCase().includes(a.toLowerCase()))) return 1.8
  if (budgetAirlines.some((a) => airline.toLowerCase().includes(a.toLowerCase()))) return 0.7
  return 1.0
}

function getTimeMultiplier(departureTime: string): number {
  const hour = new Date(departureTime).getHours()
  // Early morning and late night flights are cheaper
  if (hour < 6 || hour > 21) return 0.85
  // Peak hours are more expensive
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return 1.3
  return 1.0
}

// Calculate duration in minutes
function calculateDuration(departure: string, arrival: string): number {
  const dep = new Date(departure)
  const arr = new Date(arrival)
  return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60))
}

// Transform AviationStack flight to our Flight format
function transformFlight(flight: AviationStackFlight, index: number): Flight {
  const duration = calculateDuration(flight.departure.scheduled, flight.arrival.scheduled)
  const price = generatePrice(flight)

  return {
    id: `${flight.flight.iata}-${index}`,
    airline: flight.airline.name || "Unknown Airline",
    airlineCode: flight.airline.iata || "XX",
    flightNumber: flight.flight.iata || `XX${1000 + index}`,
    origin: {
      code: flight.departure.iata,
      city: flight.departure.airport.split(" ")[0] || flight.departure.iata,
      name: flight.departure.airport,
    },
    destination: {
      code: flight.arrival.iata,
      city: flight.arrival.airport.split(" ")[0] || flight.arrival.iata,
      name: flight.arrival.airport,
    },
    departureTime: flight.departure.scheduled,
    arrivalTime: flight.arrival.scheduled,
    duration,
    stops: 0, // AviationStack returns direct flights; for stops we'd need to combine flights
    price,
    currency: "USD",
    seatsAvailable: Math.floor(Math.random() * 50) + 5,
    aircraft: "Boeing 737", // Not provided by free tier
    cabin: "Economy",
  }
}

export async function searchFlights(
  origin: string,
  destination: string,
  date: string,
): Promise<{ flights: Flight[]; error?: string }> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY

  if (!apiKey) {
    return { flights: [], error: "API key not configured" }
  }

  try {
    // AviationStack free tier only supports real-time flights
    // We search by departure airport and filter results
    const url = new URL(`${AVIATIONSTACK_BASE_URL}/flights`)
    url.searchParams.append("access_key", apiKey)
    url.searchParams.append("dep_iata", origin)
    url.searchParams.append("arr_iata", destination)
    url.searchParams.append("limit", "100")

    const response = await fetch(url.toString())

    const responseText = await response.text()

    // Try to parse as JSON
    let data: AviationStackResponse
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error("AviationStack returned non-JSON response:", responseText.substring(0, 200))
      return { flights: [], error: "API returned invalid response" }
    }

    if ("error" in data) {
      const errorData = data as unknown as { error: { message: string; code: number } }
      console.error("AviationStack API error:", errorData.error)
      return { flights: [], error: errorData.error.message || "API error occurred" }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    if (!data.data || data.data.length === 0) {
      return { flights: [], error: "No flights found for this route" }
    }

    const flights = data.data
      .filter((f) => f.departure?.iata && f.arrival?.iata && f.airline?.name)
      .map((flight, index) => transformFlight(flight, index))

    return { flights }
  } catch (error) {
    console.error("AviationStack API error:", error)
    return {
      flights: [],
      error: error instanceof Error ? error.message : "Failed to fetch flights",
    }
  }
}

// Search airports by query (we'll use a static list since AviationStack
// airport search requires paid plan)
export function searchAirports(query: string): Airport[] {
  // This would call the API in production with a paid plan
  // For now, return from the static list in dummy-flights.ts
  return []
}
