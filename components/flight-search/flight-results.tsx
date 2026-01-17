"use client"

import { Box, Stack, Typography, Skeleton, Alert, Paper } from "@mui/material"
import { SearchOff, FlightTakeoff } from "@mui/icons-material"
import type { Flight } from "@/types/flight"
import { FlightCard } from "./flight-card"

interface FlightResultsProps {
  flights: Flight[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  dataSource?: "aviationstack" | null
}

// Skeleton loader component
const FlightSkeleton = () => (
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <Box sx={{ minWidth: 140 }}>
        <Skeleton width={100} height={24} />
        <Skeleton width={60} height={16} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton width={70} height={32} />
          <Skeleton variant="rectangular" sx={{ flex: 1, height: 4 }} />
          <Skeleton width={70} height={32} />
        </Box>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Skeleton width={80} height={36} />
        <Skeleton width={60} height={16} />
      </Box>
    </Box>
  </Paper>
)

export const FlightResults = ({ flights, isLoading, error, hasSearched, dataSource }: FlightResultsProps) => {
  // Loading state
  if (isLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightSkeleton key={i} />
        ))}
      </Stack>
    )
  }

  // Error state
  if (error) {
    // Check if it's a "no flights found" type error vs a real error
    const isNoResultsError = error.toLowerCase().includes("no flights found") || 
                             error.toLowerCase().includes("no results")
    
    if (isNoResultsError) {
      return (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <SearchOff sx={{ fontSize: 64, color: "warning.light", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Flights Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or selecting different dates.
          </Typography>
        </Paper>
      )
    }
    
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Search Error
        </Typography>
        {error}
      </Alert>
    )
  }

  // Initial state (no search yet)
  if (!hasSearched) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <FlightTakeoff sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Find Your Perfect Flight
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search for flights by entering your departure and arrival cities, along with your travel dates.
        </Typography>
      </Paper>
    )
  }

  // Empty results
  if (flights.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <SearchOff sx={{ fontSize: 64, color: "warning.light", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Flights Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or search for different dates.
        </Typography>
      </Paper>
    )
  }

  // Results list
  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </Typography>
      </Box>
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </Stack>
  )
}
