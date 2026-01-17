"use client"

import { Suspense } from "react"
import { Box, Container, Typography, Stack, Grid, CircularProgress } from "@mui/material"
import { FlightTakeoff } from "@mui/icons-material"
import { SearchForm, FlightFilters, FlightResults, PriceChart } from "@/components/flight-search"
import { useFlightSearch } from "@/hooks/use-flight-search"

function FlightSearchContent() {
  const {
    filteredFlights,
    flights,
    isLoading,
    error,
    hasSearched,
    filters,
    availableAirlines,
    priceRange,
    dataSource,
    search,
    updateFilters,
    resetFilters,
  } = useFlightSearch()

  return (
    <Box sx={{ minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
          color: "white",
          py: { xs: 4, md: 6 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <FlightTakeoff sx={{ fontSize: { xs: 32, md: 40 } }} />
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
              FlightScope
            </Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 4, maxWidth: 600 }}>
            Search thousands of flights and find the best deals with smart filters and real-time price tracking.
          </Typography>

          <SearchForm onSearch={search} isLoading={isLoading} />
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl">
        {hasSearched && (
          <Grid container spacing={3}>
            {/* Filters Sidebar */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FlightFilters
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
                priceRange={priceRange}
                availableAirlines={availableAirlines}
                disabled={isLoading}
                resultCount={filteredFlights.length}
                totalCount={flights.length}
              />
            </Grid>

            {/* Results & Chart */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Stack spacing={3}>
                {/* Price Chart */}
                <PriceChart flights={filteredFlights} isLoading={isLoading} />

                {/* Flight Results - Pass dataSource prop */}
                <FlightResults
                  flights={filteredFlights}
                  isLoading={isLoading}
                  error={error}
                  hasSearched={hasSearched}
                  dataSource={dataSource}
                />
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Initial state - show centered search prompt */}
        {!hasSearched && <FlightResults flights={[]} isLoading={isLoading} error={error} hasSearched={hasSearched} />}
      </Container>
    </Box>
  )
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FlightSearchContent />
    </Suspense>
  )
}
