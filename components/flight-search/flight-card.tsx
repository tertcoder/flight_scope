"use client"

import { Box, Paper, Typography, Chip, Stack, useMediaQuery, useTheme, Divider } from "@mui/material"
import { FlightTakeoff, FlightLand, AirlineSeatReclineNormal } from "@mui/icons-material"
import type { Flight } from "@/types/flight"
import { formatTime, formatDuration, getStopsText, formatPrice } from "@/utils/flight-utils"

interface FlightCardProps {
  flight: Flight
}

export const FlightCard = ({ flight }: FlightCardProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          gap: 2,
        }}
      >
        {/* Airline Info */}
        <Box sx={{ minWidth: 140 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {flight.airline}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {flight.flightNumber}
          </Typography>
        </Box>

        {/* Flight Times */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* Departure */}
          <Box sx={{ textAlign: "center", minWidth: { xs: 70, sm: 90 } }}>
            <Typography variant="h6" fontWeight={600}>
              {formatTime(flight.departureTime)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.origin.code}
            </Typography>
          </Box>

          {/* Flight Path Visual */}
          <Box sx={{ flex: 1, position: "relative", px: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlightTakeoff sx={{ fontSize: 16, color: "primary.main", mr: 0.5 }} />
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  backgroundColor: "divider",
                  position: "relative",
                }}
              >
                {/* Stop indicators */}
                {Array.from({ length: flight.stops }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: `${((i + 1) / (flight.stops + 1)) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "warning.main",
                      border: "2px solid white",
                    }}
                  />
                ))}
              </Box>
              <FlightLand sx={{ fontSize: 16, color: "primary.main", ml: 0.5 }} />
            </Box>
            <Box sx={{ textAlign: "center", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDuration(flight.duration)}
              </Typography>
              {!isMobile && (
                <Typography
                  variant="caption"
                  color={flight.stops === 0 ? "success.main" : "warning.main"}
                  sx={{ ml: 1 }}
                >
                  {getStopsText(flight.stops)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Arrival */}
          <Box sx={{ textAlign: "center", minWidth: { xs: 70, sm: 90 } }}>
            <Typography variant="h6" fontWeight={600}>
              {formatTime(flight.arrivalTime)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.destination.code}
            </Typography>
          </Box>
        </Box>

        <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{ mx: { md: 2 } }} />

        {/* Price & Booking */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            alignItems: { xs: "center", md: "flex-end" },
            justifyContent: "space-between",
            minWidth: { md: 130 },
          }}
        >
          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {formatPrice(flight.price, flight.currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              per person
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: { md: 1 }, ml: { xs: "auto", md: 0 } }}>
            {isMobile && (
              <Chip
                label={getStopsText(flight.stops)}
                size="small"
                color={flight.stops === 0 ? "success" : "default"}
                variant="outlined"
              />
            )}
            <Chip
              icon={<AirlineSeatReclineNormal />}
              label={`${flight.seatsAvailable} left`}
              size="small"
              variant="outlined"
              color={flight.seatsAvailable < 4 ? "error" : "default"}
            />
          </Stack>
        </Box>
      </Box>
    </Paper>
  )
}
