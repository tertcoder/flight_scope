"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import {
  Box,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Stack,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Typography,
} from "@mui/material"
import { FlightTakeoff, FlightLand, CalendarMonth, Search, SwapHoriz } from "@mui/icons-material"
import type { SearchParams, Airport } from "@/types/flight"
import { popularAirports } from "@/data/dummy-flights"

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [origin, setOrigin] = useState<Airport | string | null>(null)
  const [destination, setDestination] = useState<Airport | string | null>(null)
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")

  // Format today's date for min date attribute
  const today = useMemo(() => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  }, [])

  // Swap origin and destination
  const handleSwap = useCallback(() => {
    setOrigin(destination)
    setDestination(origin)
  }, [origin, destination])

  // Convert string input to Airport object
  const getAirportFromValue = useCallback((value: Airport | string | null): Airport | null => {
    if (!value) return null
    if (typeof value === "string") {
      // User typed a custom airport code
      const code = value.toUpperCase().trim()
      return {
        code,
        city: code,
        name: `${code} Airport`,
      }
    }
    return value
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const originAirport = getAirportFromValue(origin)
      const destinationAirport = getAirportFromValue(destination)

      if (!originAirport || !destinationAirport || !departureDate) return

      onSearch({
        origin: originAirport,
        destination: destinationAirport,
        departureDate,
        returnDate: returnDate || undefined,
        passengers: 1,
      })
    },
    [origin, destination, departureDate, returnDate, onSearch, getAirportFromValue],
  )

  // Check if form is valid - origin and destination can be Airport objects or non-empty strings
  const isValid = useMemo(() => {
    const hasOrigin = origin && (typeof origin === "string" ? origin.trim().length > 0 : true)
    const hasDestination = destination && (typeof destination === "string" ? destination.trim().length > 0 : true)
    const hasDepartureDate = departureDate.trim().length > 0
    return hasOrigin && hasDestination && hasDepartureDate
  }, [origin, destination, departureDate])

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        backgroundColor: "background.paper",
      }}
    >
      <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="flex-start">
        {/* Origin */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <Autocomplete
            freeSolo
            value={origin}
            onInputChange={(_, newInputValue, reason) => {
              // If user is typing and it's not a selected option, update origin to the string value
              if (reason === "input" && newInputValue) {
                const matchingAirport = popularAirports.find((ap) => `${ap.city} (${ap.code})` === newInputValue)
                if (!matchingAirport) {
                  setOrigin(newInputValue)
                }
              } else if (reason === "clear") {
                setOrigin(null)
              }
            }}
            onChange={(_, newValue) => {
              setOrigin(newValue)
            }}
            options={popularAirports}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option
              return `${option.city} (${option.code})`
            }}
            renderOption={({ key, ...props }, option) => {
              if (typeof option === "string") {
                return (
                  <Box component="li" key={key} {...props}>
                    <Typography variant="body1">{option}</Typography>
                  </Box>
                )
              }
              return (
                <Box component="li" key={key} {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {option.city} ({option.code})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                </Box>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="From"
                placeholder="City or airport code"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlightTakeoff color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            disabled={isLoading}
          />
        </Box>

        {/* Swap Button */}
        {!isMobile && (
          <Button
            onClick={handleSwap}
            sx={{
              minWidth: 48,
              height: 56,
              borderRadius: 2,
            }}
            disabled={isLoading}
          >
            <SwapHoriz />
          </Button>
        )}

        {/* Destination */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <Autocomplete
            freeSolo
            value={destination}
            onInputChange={(_, newInputValue, reason) => {
              // If user is typing and it's not a selected option, update destination to the string value
              if (reason === "input" && newInputValue) {
                const matchingAirport = popularAirports.find((ap) => `${ap.city} (${ap.code})` === newInputValue)
                if (!matchingAirport) {
                  setDestination(newInputValue)
                }
              } else if (reason === "clear") {
                setDestination(null)
              }
            }}
            onChange={(_, newValue) => {
              setDestination(newValue)
            }}
            options={popularAirports}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option
              return `${option.city} (${option.code})`
            }}
            renderOption={({ key, ...props }, option) => {
              if (typeof option === "string") {
                return (
                  <Box component="li" key={key} {...props}>
                    <Typography variant="body1">{option}</Typography>
                  </Box>
                )
              }
              return (
                <Box component="li" key={key} {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {option.city} ({option.code})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                </Box>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="To"
                placeholder="City or airport code"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlightLand color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            disabled={isLoading}
          />
        </Box>

        {/* Departure Date */}
        <Box sx={{ flex: 0.8, width: "100%" }}>
          <TextField
            type="date"
            label="Departure"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth color="action" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            fullWidth
            disabled={isLoading}
          />
        </Box>

        {/* Return Date (Optional) */}
        <Box sx={{ flex: 0.8, width: "100%" }}>
          <TextField
            type="date"
            label="Return (optional)"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth color="action" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: departureDate || today }}
            fullWidth
            disabled={isLoading}
          />
        </Box>

        {/* Search Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!isValid || isLoading}
          startIcon={<Search />}
          sx={{
            height: 56,
            minWidth: { xs: "100%", md: 140 },
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </Stack>
    </Paper>
  )
}
