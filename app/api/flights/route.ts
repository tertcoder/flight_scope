import { type NextRequest, NextResponse } from "next/server"
import { searchFlights } from "@/api/aviationstack"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const date = searchParams.get("date")

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: "Missing required parameters: origin, destination, date" }, { status: 400 })
  }

  // Search flights using the API
  const { flights, error } = await searchFlights(origin, destination, date)

  if (error) {
    // Return 200 with error message so client can display it properly
    // This allows the UI to show user-friendly error messages instead of HTTP status codes
    return NextResponse.json({ flights: [], source: "aviationstack", error }, { status: 200 })
  }

  return NextResponse.json({ flights, source: "aviationstack" })
}
