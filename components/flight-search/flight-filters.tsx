"use client"

import { useCallback } from "react"
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { ExpandMore, FilterAlt, RestartAlt } from "@mui/icons-material"
import type { FilterState } from "@/types/flight"
import { formatPrice, getAirlineName } from "@/utils/flight-utils"

interface FlightFiltersProps {
  filters: FilterState
  onFilterChange: (updates: Partial<FilterState>) => void
  onReset: () => void
  priceRange: { min: number; max: number }
  availableAirlines: string[]
  disabled: boolean
  resultCount: number
  totalCount: number
}

const STOP_OPTIONS = [
  { value: 0, label: "Nonstop" },
  { value: 1, label: "1 stop" },
  { value: 2, label: "2+ stops" },
]

export const FlightFilters = ({
  filters,
  onFilterChange,
  onReset,
  priceRange,
  availableAirlines,
  disabled,
  resultCount,
  totalCount,
}: FlightFiltersProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Handle price slider change (for dragging)
  const handlePriceChange = useCallback(
    (_: Event, value: number | number[]) => {
      onFilterChange({ maxPrice: value as number })
    },
    [onFilterChange],
  )

  // Handle clicking on min price label
  const handleMinPriceClick = useCallback(() => {
    onFilterChange({ maxPrice: priceRange.min })
  }, [onFilterChange, priceRange.min])

  // Handle clicking on max price label
  const handleMaxPriceClick = useCallback(() => {
    onFilterChange({ maxPrice: priceRange.max })
  }, [onFilterChange, priceRange.max])

  // Handle stops toggle
  const handleStopsChange = useCallback(
    (stopValue: number, checked: boolean) => {
      const newStops = checked ? [...filters.stops, stopValue] : filters.stops.filter((s) => s !== stopValue)
      onFilterChange({ stops: newStops })
    },
    [filters.stops, onFilterChange],
  )

  // Handle airline toggle
  const handleAirlineChange = useCallback(
    (airlineCode: string, checked: boolean) => {
      const newAirlines = checked
        ? [...filters.airlines, airlineCode]
        : filters.airlines.filter((a) => a !== airlineCode)
      onFilterChange({ airlines: newAirlines })
    },
    [filters.airlines, onFilterChange],
  )

  const hasActiveFilters = filters.maxPrice < priceRange.max || filters.stops.length > 0 || filters.airlines.length > 0

  const FilterContent = () => (
    <Stack spacing={3}>
      {/* Active filters count */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterAlt color="primary" fontSize="small" />
          <Typography variant="subtitle2" color="text.secondary">
            {resultCount} of {totalCount} flights
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button size="small" startIcon={<RestartAlt />} onClick={onReset} disabled={disabled}>
            Reset
          </Button>
        )}
      </Box>

      <Divider />

      {/* Price Filter */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Max Price
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.maxPrice}
            onChange={handlePriceChange}
            onChangeCommitted={(_, value) => {
              // Ensure value is committed when dragging ends
              onFilterChange({ maxPrice: value as number })
            }}
            min={priceRange.min}
            max={priceRange.max}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => formatPrice(v)}
            disabled={disabled}
            sx={{
              // Ensure proper dragging behavior
              "& .MuiSlider-thumb": {
                cursor: disabled ? "not-allowed" : "grab",
                "&:active": {
                  cursor: disabled ? "not-allowed" : "grabbing",
                },
              },
              "& .MuiSlider-track": {
                cursor: disabled ? "not-allowed" : "pointer",
              },
              "& .MuiSlider-rail": {
                cursor: disabled ? "not-allowed" : "pointer",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: -0.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              onClick={handleMinPriceClick}
              sx={{
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                "&:hover": {
                  color: disabled ? "text.secondary" : "primary.main",
                  textDecoration: disabled ? "none" : "underline",
                },
              }}
            >
              {formatPrice(priceRange.min)}
            </Typography>
            <Chip label={formatPrice(filters.maxPrice)} size="small" color="primary" variant="outlined" />
            <Typography
              variant="caption"
              color="text.secondary"
              onClick={handleMaxPriceClick}
              sx={{
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                "&:hover": {
                  color: disabled ? "text.secondary" : "primary.main",
                  textDecoration: disabled ? "none" : "underline",
                },
              }}
            >
              {formatPrice(priceRange.max)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Stops Filter */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Stops
        </Typography>
        <FormGroup>
          {STOP_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.stops.includes(option.value)}
                  onChange={(e) => handleStopsChange(option.value, e.target.checked)}
                  disabled={disabled}
                  size="small"
                />
              }
              label={<Typography variant="body2">{option.label}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider />

      {/* Airlines Filter */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Airlines
        </Typography>
        <FormGroup>
          {availableAirlines.map((code) => (
            <FormControlLabel
              key={code}
              control={
                <Checkbox
                  checked={filters.airlines.includes(code)}
                  onChange={(e) => handleAirlineChange(code, e.target.checked)}
                  disabled={disabled}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" noWrap>
                  {getAirlineName(code)}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>
    </Stack>
  )

  // Mobile: Accordion layout
  if (isMobile) {
    return (
      <Accordion defaultExpanded={false} disabled={disabled} sx={{ borderRadius: 2, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterAlt />
            <Typography fontWeight={500}>Filters</Typography>
            {hasActiveFilters && (
              <Chip
                label={
                  (filters.stops.length > 0 ? 1 : 0) +
                  (filters.airlines.length > 0 ? 1 : 0) +
                  (filters.maxPrice < priceRange.max ? 1 : 0)
                }
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <FilterContent />
        </AccordionDetails>
      </Accordion>
    )
  }

  // Desktop: Sidebar layout
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2,
        position: "sticky",
        top: 16,
      }}
    >
      <FilterContent />
    </Paper>
  )
}
