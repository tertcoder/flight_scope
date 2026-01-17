import type { Flight, Airport } from "@/types/flight"

// Comprehensive airline dictionary
export const airlineDictionary: Record<string, string> = {
  AA: "American Airlines",
  UA: "United Airlines",
  DL: "Delta Air Lines",
  SW: "Southwest Airlines",
  B6: "JetBlue Airways",
  AS: "Alaska Airlines",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  WN: "Southwest",
  LH: "Lufthansa",
  BA: "British Airways",
  AF: "Air France",
  KL: "KLM Royal Dutch",
  EK: "Emirates",
}

// Popular airports for autocomplete
export const popularAirports: Airport[] = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles" },
  { code: "ORD", name: "O'Hare International", city: "Chicago" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas" },
  { code: "DEN", name: "Denver International", city: "Denver" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco" },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta", city: "Atlanta" },
  { code: "BOS", name: "Logan International", city: "Boston" },
  { code: "MIA", name: "Miami International", city: "Miami" },
  { code: "LHR", name: "Heathrow", city: "London" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris" },
]

