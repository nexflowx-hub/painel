'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  glitch?: boolean
}

export default function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    // Atlas Blue color palette
    const darkColors = ['#0055ff', '#0077ff', '#00aaff', '#00d4ff']
    const lightColors = ['#0055ff20', '#0077ff15', '#00aaff10', '#00d4ff08']
    const glitchColor = '#ff003c'

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    const colors = isDark ? darkColors : lightColors
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1, // Slow upward drift
        size: Math.random() * 2 + 0.5,
        opacity: isDark ? Math.random() * 0.4 + 0.1 : Math.random() * 0.15 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        glitch: Math.random() > 0.98, // Very rare glitch
      })
    }

    let glitchFrame = 0
    let lastGlitch = 0

    const draw = () => {
      const now = Date.now()
      const bgColor = isDark ? '#050505' : '#fafafa'
      
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Subtle grid lines
      const gridOpacity = isDark ? 0.02 : 0.03
      ctx.strokeStyle = isDark 
        ? `rgba(0, 85, 255, ${gridOpacity})` 
        : `rgba(0, 85, 255, ${gridOpacity})`
      ctx.lineWidth = 1
      const gridSize = 80

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical rain lines (Matrix-style but blue)
      if (isDark) {
        const time = now * 0.001
        for (let i = 0; i < 15; i++) {
          const x = ((i * 137) % canvas.width) + Math.sin(time + i) * 20
          const lineLength = 100 + Math.sin(time * 0.5 + i) * 50
          const y = ((time * 30 + i * 50) % (canvas.height + lineLength)) - lineLength
          
          const gradient = ctx.createLinearGradient(x, y, x, y + lineLength)
          gradient.addColorStop(0, 'rgba(0, 212, 255, 0)')
          gradient.addColorStop(0.5, 'rgba(0, 170, 255, 0.08)')
          gradient.addColorStop(1, 'rgba(0, 85, 255, 0)')
          
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + lineLength)
          ctx.stroke()
        }
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        
        // Rare red glitch effect
        if (p.glitch && now - lastGlitch > 3000 && Math.random() > 0.995) {
          ctx.fillStyle = glitchColor
          ctx.globalAlpha = 0.6
          lastGlitch = now
          glitchFrame = 3
        } else {
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.opacity
        }
        
        ctx.fill()
      }

      // Connection lines between close particles
      ctx.globalAlpha = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = isDark 
              ? `rgba(0, 170, 255, ${0.03 * (1 - dist / 100)})` 
              : `rgba(0, 85, 255, ${0.02 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Ambient glow pulses
      if (isDark) {
        const pulse = Math.sin(now * 0.001) * 0.5 + 0.5
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.3, canvas.height * 0.4, 0,
          canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.5
        )
        gradient.addColorStop(0, `rgba(0, 85, 255, ${0.03 * pulse})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Second glow
        const gradient2 = ctx.createRadialGradient(
          canvas.width * 0.7, canvas.height * 0.6, 0,
          canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.4
        )
        gradient2.addColorStop(0, `rgba(0, 212, 255, ${0.02 * (1 - pulse)})`)
        gradient2.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient2
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Glitch frame effect
      if (glitchFrame > 0) {
        ctx.fillStyle = `rgba(255, 0, 60, ${0.02 * glitchFrame})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        glitchFrame--
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  useEffect(() => {
    const cleanup = init()
    return cleanup
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: -10,
        opacity: isDark ? 1 : 0.5,
      }}
    />
  )
}
