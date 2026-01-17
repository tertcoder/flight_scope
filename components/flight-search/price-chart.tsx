"use client"

import { useMemo } from "react"
import { Paper, Typography, Box, Stack, Chip, useTheme, Skeleton } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import type { Flight } from "@/types/flight"
import { transformToChartData, getPriceStats, formatPrice } from "@/utils/flight-utils"

interface PriceChartProps {
  flights: Flight[]
  isLoading: boolean
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { airline: string; price: number; stops: number } }>
}) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  return (
    <Paper sx={{ p: 1.5, boxShadow: 3 }}>
      <Typography variant="subtitle2" fontWeight={600}>
        {data.airline}
      </Typography>
      <Typography variant="body2" color="primary.main" fontWeight={500}>
        {formatPrice(data.price)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.stops === 0 ? "Nonstop" : `${data.stops} stop${data.stops > 1 ? "s" : ""}`}
      </Typography>
    </Paper>
  )
}

export const PriceChart = ({ flights, isLoading }: PriceChartProps) => {
  const theme = useTheme()

  // Memoized chart data - transforms and aggregates flight data
  const chartData = useMemo(() => {
    if (flights.length === 0) return []

    const data = transformToChartData(flights)

    // Group by airline and get average price
    const airlineMap = new Map<string, { prices: number[]; stops: number[] }>()

    data.forEach((item) => {
      const existing = airlineMap.get(item.airline)
      if (existing) {
        existing.prices.push(item.price)
        existing.stops.push(item.stops)
      } else {
        airlineMap.set(item.airline, {
          prices: [item.price],
          stops: [item.stops],
        })
      }
    })

    // Convert to chart format with average prices
    return Array.from(airlineMap.entries())
      .map(([airline, { prices, stops }]) => ({
        airline: airline.split(" ")[0], // Shorten for chart
        fullName: airline,
        price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        stops: Math.round(stops.reduce((a, b) => a + b, 0) / stops.length),
        count: prices.length,
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 8) // Limit to 8 airlines for readability
  }, [flights])

  // Price statistics
  const stats = useMemo(() => getPriceStats(flights), [flights])

  // Color based on price relative to average
  const getBarColor = (price: number): string => {
    if (price <= stats.avg * 0.85) return theme.palette.success.main
    if (price >= stats.avg * 1.15) return theme.palette.error.light
    return theme.palette.primary.main
  }

  // Loading state
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Skeleton width={200} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={250} />
      </Paper>
    )
  }

  // Empty state
  if (flights.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="subtitle1">Price trends will appear after searching</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Price by Airline
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={`Avg: ${formatPrice(stats.avg)}`} size="small" variant="outlined" />
          <Chip label={`Low: ${formatPrice(stats.min)}`} size="small" color="success" variant="outlined" />
        </Stack>
      </Box>

      <Box sx={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis
              dataKey="airline"
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={stats.avg}
              stroke={theme.palette.warning.main}
              strokeDasharray="5 5"
              label={{
                value: "Avg",
                position: "right",
                fill: theme.palette.warning.main,
                fontSize: 11,
              }}
            />
            <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.price)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              backgroundColor: "success.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Below avg
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              backgroundColor: "primary.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Average
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              backgroundColor: "error.light",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Above avg
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
