'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { motion } from 'framer-motion'

export interface NeonChartProps {
  data: Array<{ name: string; value: number }>
  type?: 'line' | 'bar' | 'area'
  color?: string
  height?: number
  showGrid?: boolean
  className?: string
}

function NeonTooltip({
  active,
  payload,
  label,
  color,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  color?: string
}) {
  if (!active || !payload?.length) return null

  const c = color || '#00D4AA'

  return (
    <div
      className="nex-mono px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'rgba(11, 15, 20, 0.95)',
        border: `1px solid ${c}30`,
        boxShadow: `0 0 20px ${c}15`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <p style={{ color: '#A0A0A0', marginBottom: '2px' }}>{label}</p>
      <p className="font-bold" style={{ color: c }}>
        {typeof payload[0].value === 'number'
          ? payload[0].value.toLocaleString()
          : payload[0].value}
      </p>
    </div>
  )
}

export default function NeonChart({
  data,
  type = 'line',
  color = '#00D4AA',
  height = 220,
  showGrid = false,
  className,
}: NeonChartProps) {
  const c = color || '#00D4AA'

  const gradientId = `neonChartGrad-${c.replace('#', '')}`
  const filterId = `neonChartGlow-${c.replace('#', '')}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={className}
      style={{ width: '100%', height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<NeonTooltip color={c} />}
              cursor={{ fill: `${c}08` }}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity="0.8" />
                <stop offset="100%" stopColor={c} stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="value"
              fill={`url(#${gradientId})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<NeonTooltip color={c} />}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </linearGradient>
              <filter id={filterId}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={c}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: c,
                stroke: '#0F1117',
                strokeWidth: 2,
              }}
              filter={`url(#${filterId})`}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<NeonTooltip color={c} />}
            />
            <defs>
              <filter id={filterId}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Line
              type="monotone"
              dataKey="value"
              stroke={c}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: c,
                stroke: '#0F1117',
                strokeWidth: 2,
              }}
              filter={`url(#${filterId})`}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  )
}
