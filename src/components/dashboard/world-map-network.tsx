'use client'

import { useMemo, useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { geoMercator } from 'd3-geo'

// ─── GeoJSON (Natural Earth 110m) ──────────────────────────────
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ─── Design tokens ─────────────────────────────────────────────
const ACCENT = '#00D4AA'
const MAP_W = 800
const MAP_H = 480

// ─── Projection config (must exactly match ComposableMap) ──────
const PROJ_CENTER: [number, number] = [0, 20]
const PROJ_SCALE = 140

// ─── Data ──────────────────────────────────────────────────────
interface MapNode {
  id: string
  label: string
  lon: number
  lat: number
}

interface Connection {
  from: string
  to: string
  strength: number
}

const nodes: MapNode[] = [
  { id: 'usa',       label: 'USA',       lon: -74,  lat: 41 },   // New York
  { id: 'uk',        label: 'UK',        lon: -1,   lat: 54 },   // London
  { id: 'spain',     label: 'Spain',     lon: -4,   lat: 40 },   // Madrid
  { id: 'portugal',  label: 'Portugal',  lon: -9,   lat: 39 },   // Lisbon
  { id: 'italy',     label: 'Italy',     lon: 12,   lat: 42 },   // Rome
  { id: 'brazil',    label: 'Brazil',    lon: -47,  lat: -24 },  // São Paulo
  { id: 'argentina', label: 'Argentina', lon: -58,  lat: -35 },  // Buenos Aires
  { id: 'mexico',    label: 'Mexico',    lon: -99,  lat: 19 },   // Mexico City
  { id: 'colombia',  label: 'Colombia',  lon: -74,  lat: 5 },    // Bogota
  { id: 'chile',     label: 'Chile',     lon: -71,  lat: -33 },  // Santiago
  { id: 'angola',    label: 'Angola',    lon: 13,   lat: -9 },   // Luanda
  { id: 'singapore', label: 'Singapore', lon: 104,  lat: 1 },    // Singapore
  { id: 'japan',     label: 'Japan',     lon: 140,  lat: 36 },   // Tokyo
]

const connections: Connection[] = [
  { from: 'usa',       to: 'uk',        strength: 3 },
  { from: 'usa',       to: 'japan',     strength: 2 },
  { from: 'uk',        to: 'singapore', strength: 2 },
  { from: 'uk',        to: 'argentina', strength: 2 },
  { from: 'spain',     to: 'argentina', strength: 2 },
  { from: 'mexico',    to: 'colombia',  strength: 1 },
  { from: 'colombia',  to: 'italy',     strength: 1 },
  { from: 'angola',    to: 'portugal',  strength: 3 },
  { from: 'brazil',    to: 'chile',     strength: 1 },
  { from: 'portugal',  to: 'brazil',    strength: 2 },
  { from: 'singapore', to: 'japan',     strength: 2 },
]

// ─── Bezier curve (flight-arc style) ───────────────────────────
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const arc = dist * 0.25          // height of the arc
  const spread = dist * 0.35       // horizontal spread of control points
  return `M ${x1} ${y1} C ${x1 + spread} ${y1 - arc}, ${x2 - spread} ${y2 - arc}, ${x2} ${y2}`
}

// ─── Component ─────────────────────────────────────────────────
export default function WorldMapNetwork() {
  const [mapReady, setMapReady] = useState(false)
  const [geoError, setGeoError] = useState(false)

  // Exact same projection react-simple-maps uses internally
  const projection = useMemo(() => {
    return geoMercator()
      .center(PROJ_CENTER)
      .scale(PROJ_SCALE)
      .translate([MAP_W / 2, MAP_H / 2])
      .rotate([0, 0, 0])
  }, [])

  // Project every node to pixel coordinates in the SVG space
  const projected = useMemo(() => {
    return nodes.map((n) => {
      const [x, y] = projection([n.lon, n.lat]) ?? [0, 0]
      return { ...n, x, y }
    })
  }, [projection])

  // Connection paths in pixel space
  const paths = useMemo(() => {
    return connections
      .map((conn, i) => {
        const from = projected.find((n) => n.id === conn.from)
        const to = projected.find((n) => n.id === conn.to)
        if (!from || !to) return null
        return {
          id: `c-${conn.from}-${conn.to}`,
          d: bezier(from.x, from.y, to.x, to.y),
          strength: conn.strength,
          delay: i * 0.35,
          dur: 3.5 + i * 0.5,
        }
      })
      .filter(Boolean) as {
        id: string
        d: string
        strength: number
        delay: number
        dur: number
      }[]
  }, [projected])

  // Reset mapReady when component mounts
  useEffect(() => {
    setMapReady(false)
    setGeoError(false)
  }, [])

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px]"
      style={{
        background: '#0C0E14',
        border: '1px solid #1E222C',
      }}
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,212,170,0.05), transparent 80%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          SINGLE SVG: real map + animations (pixel-perfect alignment)
          ═══════════════════════════════════════════════════════ */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: PROJ_CENTER,
          scale: PROJ_SCALE,
          rotation: [0, 0, 0],
        }}
        width={MAP_W}
        height={MAP_H}
        className="w-full h-full"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* ─── GEOGRAPHY ─── */}
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            if (geographies.length === 0 && !geoError) {
              setGeoError(true)
            }
            if (geographies.length > 0 && !mapReady) {
              setTimeout(() => setMapReady(true), 80)
            }
            
            return geographies.map((geo: any) => (
              <Geography
                key={(geo as any).rsmKey || geo.id || JSON.stringify(geo.properties)}
                geography={geo}
                fill="#161B26"
                stroke="#1E222C"
                strokeWidth={0.3}
                style={{
                  default:  { fill: '#161B26', stroke: '#1E222C', strokeWidth: 0.3 },
                  hover:    { fill: '#1C2230', stroke: '#283040', strokeWidth: 0.3 },
                  pressed:  { fill: '#1C2230', stroke: '#283040', strokeWidth: 0.3 },
                }}
              />
            ))
          }}
        </Geographies>

        {/* ─── SVG DEFS ─── */}
        <defs>
          <filter id="wm-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="wm-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={ACCENT} stopOpacity="0" />
            <stop offset="50%"  stopColor={ACCENT} stopOpacity="1" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>

          <linearGradient id="wm-line-strong" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.15" />
            <stop offset="50%"  stopColor={ACCENT} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ─── CSS KEYFRAMES ─── */}
        <style>{`
          @keyframes wm-pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes wm-dash-flow {
            to { stroke-dashoffset: -20; }
          }
        `}</style>

        {/* ═══ CONNECTION BASE LINES ═══ */}
        {paths.map((p) => (
          <path
            key={`base-${p.id}`}
            id={p.id}
            d={p.d}
            fill="none"
            stroke={ACCENT}
            strokeWidth={0.5 + p.strength * 0.3}
            opacity={0.06 + p.strength * 0.04}
            strokeLinecap="round"
          />
        ))}

        {/* ═══ ANIMATED FLOW LINES ═══ */}
        {paths.map((p, i) => (
          <path
            key={`flow-${p.id}`}
            d={p.d}
            fill="none"
            stroke={`url(#${p.strength >= 3 ? 'wm-line-strong' : 'wm-line-grad'})`}
            strokeWidth={0.5 + p.strength * 0.2}
            strokeLinecap="round"
            strokeDasharray="4 4"
            style={{
              animation: `wm-dash-flow ${2.2 + i * 0.3}s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: mapReady ? 1 : 0,
              transition: 'opacity 1s ease-in',
            }}
          />
        ))}

        {/* ═══ PARTICLES ═══ */}
        {paths.map((p) => (
          <g key={`part-${p.id}`}>
            {/* Forward */}
            <circle r="2.5" fill={ACCENT} opacity="0.9" filter="url(#wm-glow)">
              <animateMotion
                dur={`${p.dur}s`}
                repeatCount="indefinite"
                begin={`${p.delay}s`}
              >
                <mpath href={`#${p.id}`} />
              </animateMotion>
            </circle>
            {/* Reverse */}
            <circle r="1.8" fill={ACCENT} opacity="0.45" filter="url(#wm-glow)">
              <animateMotion
                dur={`${p.dur + 1}s`}
                repeatCount="indefinite"
                begin={`${p.delay + p.dur / 2}s`}
                keyPoints="1;0"
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#${p.id}`} />
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* ═══ NODES ═══ */}
        {projected.map((node, idx) => (
          <g
            key={node.id}
            style={{
              opacity: mapReady ? 1 : 0,
              transition: `opacity 0.8s ease-in ${idx * 0.06}s`,
            }}
          >
            {/* Pulse ring 1 */}
            <circle
              cx={node.x}
              cy={node.y}
              fill="none"
              stroke={ACCENT}
              strokeWidth="0.3"
              r="6"
            >
              <animate
                attributeName="r"
                values="6;12;6"
                dur="2.5s"
                repeatCount="indefinite"
                begin={`${idx * 0.15}s`}
              />
              <animate
                attributeName="opacity"
                values="0.15;0.35;0.15"
                dur="2.5s"
                repeatCount="indefinite"
                begin={`${idx * 0.15}s`}
              />
            </circle>

            {/* Pulse ring 2 (offset) */}
            <circle
              cx={node.x}
              cy={node.y}
              fill="none"
              stroke={ACCENT}
              strokeWidth="0.2"
              r="6"
            >
              <animate
                attributeName="r"
                values="6;16;6"
                dur="2.8s"
                repeatCount="indefinite"
                begin={`${idx * 0.15 + 1.2}s`}
              />
              <animate
                attributeName="opacity"
                values="0.08;0.18;0.08"
                dur="2.8s"
                repeatCount="indefinite"
                begin={`${idx * 0.15 + 1.2}s`}
              />
            </circle>

            {/* Glow backdrop */}
            <circle
              cx={node.x}
              cy={node.y}
              r="8"
              fill={ACCENT}
              opacity="0.08"
              filter="url(#wm-glow)"
            />

            {/* Core dot */}
            <circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill={ACCENT}
              filter="url(#wm-glow)"
            />

            {/* White center */}
            <circle cx={node.x} cy={node.y} r="1.2" fill="#fff" opacity="0.9" />

            {/* Label */}
            <text
              x={node.x}
              y={node.y + 16}
              textAnchor="middle"
              fill={ACCENT}
              fontSize="7.5"
              fontWeight="600"
              opacity="0.8"
              style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </ComposableMap>

      {/* ─── Title overlay ─── */}
      <div className="absolute top-4 left-5 z-[3] flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: ACCENT,
            boxShadow: `0 0 6px ${ACCENT}`,
            animation: 'wm-pulse-dot 2s ease-in-out infinite',
          }}
        />
        <span
          className="text-sm font-semibold text-white tracking-wide"
          style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
        >
          Global Network
        </span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-1"
          style={{
            color: ACCENT,
            background: 'rgba(0,212,170,0.06)',
            border: '1px solid rgba(0,212,170,0.15)',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          LIVE
        </span>
      </div>

      {/* ─── Bottom metrics ─── */}
      <div
        className="absolute bottom-4 left-5 flex flex-wrap gap-4 sm:gap-6 z-[3]"
        style={{
          background: 'linear-gradient(to right, rgba(12,14,20,0.85), transparent)',
          padding: '8px 12px 8px 4px',
        }}
      >
        {[
          { val: '120+',  label: 'Countries' },
          { val: '99.9%', label: 'Uptime' },
          { val: '24/7',  label: 'Monitoring' },
          { val: '<300ms', label: 'Latency' },
        ].map((m) => (
          <div key={m.label} className="text-[11px]" style={{ color: '#606060' }}>
            <span className="text-white font-semibold">{m.val}</span> {m.label}
          </div>
        ))}
      </div>

      {/* ─── Top-right badge ─── */}
      <div className="absolute top-4 right-5 z-[3] flex items-center gap-2">
        <div
          className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
          style={{
            color: '#A0A0A0',
            background: 'rgba(20,23,30,0.7)',
            border: '1px solid #1E222C',
            fontFamily: 'var(--font-geist-mono), monospace',
            backdropFilter: 'blur(4px)',
          }}
        >
          {nodes.length} Nodes · {connections.length} Routes
        </div>
      </div>

      {/* ─── Error fallback overlay ─── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-[10]" style={{ background: 'rgba(12,14,20,0.95)' }}>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-3" style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
            <p className="text-sm text-white font-medium mb-1">Global Network</p>
            <p className="text-xs text-gray-500">Map loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
