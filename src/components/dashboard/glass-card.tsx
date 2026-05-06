'use client'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

export interface GlassCardProps {
  children: React.ReactNode
  title?: string
  className?: string
  glow?: boolean
  titleExtra?: React.ReactNode
}

export default function GlassCard({
  children,
  title,
  className,
  glow = false,
  titleExtra,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'glass-panel hover-lift',
        glow && 'glow-box',
        className
      )}
    >
      {title && (
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: '#A0A0A0' }}
            >
              {title}
            </h3>
            {titleExtra}
          </div>
          <Separator
            className="mt-3 mb-4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }}
          />
        </div>
      )}
      <div className={cn(title ? 'px-5 pb-5' : 'p-5')}>
        {children}
      </div>
    </motion.div>
  )
}
