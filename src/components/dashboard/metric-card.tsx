'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

function generateSparklinePoints(width: number, height: number, data: number[]): string {
  if (data.length < 2) return ''
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const padding = 2
  const usableW = width - padding * 2
  const usableH = height - padding * 2

  return data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * usableW
      const y = padding + usableH - ((val - min) / range) * usableH
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export interface MetricCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: string
  delay?: number
  sparkData?: number[]
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = '#00D4AA',
  delay = 0,
  sparkData,
}: MetricCardProps) {
  const sparkPoints = useMemo(() => {
    if (!sparkData || sparkData.length < 2) return null
    return generateSparklinePoints(120, 36, sparkData)
  }, [sparkData])

  const isPositive = change !== undefined && change >= 0
  const glowColor = color === '#FF5252' ? 'rgba(255, 59, 92, 0.15)' : `${color}15`
  const glowColorHover = color === '#FF5252' ? 'rgba(255, 59, 92, 0.25)' : `${color}25`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: 'easeOut' }}
      className="glass-panel glow-box hover-lift relative overflow-hidden p-5 cursor-default"
      style={{
        boxShadow: `0 0 30px ${glowColor}, 0 4px 32px rgba(0, 0, 0, 0.5)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px ${glowColorHover}, 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 60px ${glowColor}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}, 0 4px 32px rgba(0, 0, 0, 0.5)`
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${color}12, transparent 60%), 
                       radial-gradient(ellipse at 70% 100%, ${color}08, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row: icon + title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}20`,
              }}
            >
              {icon}
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span
            className="text-3xl font-bold nex-mono tracking-tight"
            style={{
              color: '#FFFFFF',
              textShadow: `0 0 12px ${color}40, 0 0 30px ${color}15`,
            }}
          >
            {value}
          </span>
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mb-4">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#00D4AA' }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: '#FF5252' }} />
            )}
            <span
              className="nex-mono text-xs font-semibold"
              style={{ color: isPositive ? '#00D4AA' : '#FF5252' }}
            >
              {isPositive ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-xs" style={{ color: '#A0A0A0' }}>
                {changeLabel}
              </span>
            )}
          </div>
        )}

        {/* Sparkline */}
        {sparkPoints && (
          <svg
            viewBox="0 0 120 36"
            className="w-full h-9 mt-auto"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`spark-gradient-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <>
              {/* Area fill */}
              <polygon
                points={`2,34 ${sparkPoints} 118,34`}
                fill={`url(#spark-gradient-${title.replace(/\s/g, '')})`}
              />
              {/* Line */}
              <polyline
                points={sparkPoints}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </>
          </svg>
        )}
      </div>
    </motion.div>
  )
}
