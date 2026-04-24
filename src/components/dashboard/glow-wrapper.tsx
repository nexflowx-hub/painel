'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface GlowWrapperProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export default function GlowWrapper({
  children,
  color = '#00D4AA',
  className,
}: GlowWrapperProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
    >
      {/* Glow layer */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${color}25, 0 0 80px ${color}10, inset 0 0 20px ${color}08`,
        }}
        aria-hidden="true"
      />
      {/* Content */}
      <motion.div
        className="relative"
        whileHover={{
          boxShadow: `0 0 30px ${color}20, 0 0 60px ${color}08`,
          transition: { duration: 0.3 },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
