'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * CyberGridBackground - 3D Grid with Fiber Optic Trails
 * Creates an immersive "living background" effect for login/register pages
 * Features:
 * - 3D perspective grid that undulates
 * - Fiber optic "light trails" that travel along grid lines
 * - Atlas Blue (#00B4D8) and Cyan (#00D4AA) color scheme
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface FiberTrail {
  progress: number;
  speed: number;
  lineIndex: number;
  isHorizontal: boolean;
  color: string;
  length: number;
  opacity: number;
}

interface GridNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
}

export default function CyberGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Configuration
    const GRID_SIZE = 50;
    const WAVE_AMPLITUDE = 8;
    const WAVE_SPEED = 0.0015;
    const FIBER_COUNT = 12;
    const PARTICLE_COUNT = 60;

    // Colors - Atlas Blue and Cyan
    const colors = {
      atlasBlue: '#00B4D8',
      cyan: '#00D4AA',
      atlasBlueRGB: { r: 0, g: 180, b: 216 },
      cyanRGB: { r: 0, g: 212, b: 170 },
    };

    // Particles
    const particles: Particle[] = [];
    
    // Fiber optic trails
    const fiberTrails: FiberTrail[] = [];
    
    // Grid nodes for 3D effect
    let gridNodes: GridNode[][] = [];
    let cols = 0;
    let rows = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recalculate grid
      cols = Math.ceil(canvas.width / GRID_SIZE) + 2;
      rows = Math.ceil(canvas.height / GRID_SIZE) + 2;
      
      gridNodes = [];
      for (let i = 0; i < rows; i++) {
        gridNodes[i] = [];
        for (let j = 0; j < cols; j++) {
          gridNodes[i][j] = {
            x: j * GRID_SIZE,
            y: i * GRID_SIZE,
            baseX: j * GRID_SIZE,
            baseY: i * GRID_SIZE,
            offsetX: 0,
            offsetY: 0,
          };
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? colors.atlasBlue : colors.cyan,
      });
    }

    // Initialize fiber optic trails
    const createFiberTrail = (): FiberTrail => ({
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      lineIndex: Math.floor(Math.random() * Math.max(cols, rows)),
      isHorizontal: Math.random() > 0.5,
      color: Math.random() > 0.5 ? colors.atlasBlue : colors.cyan,
      length: 0.1 + Math.random() * 0.15,
      opacity: 0.3 + Math.random() * 0.4,
    });

    for (let i = 0; i < FIBER_COUNT; i++) {
      fiberTrails.push(createFiberTrail());
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      // Update grid nodes with 3D wave effect
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const node = gridNodes[i][j];
          const waveX = Math.sin(node.baseX * 0.01 + time * WAVE_SPEED) * WAVE_AMPLITUDE;
          const waveY = Math.cos(node.baseY * 0.01 + time * WAVE_SPEED * 0.8) * WAVE_AMPLITUDE;
          const wave2X = Math.sin((node.baseX + node.baseY) * 0.008 + time * WAVE_SPEED * 1.2) * WAVE_AMPLITUDE * 0.5;
          
          node.x = node.baseX + waveX + wave2X;
          node.y = node.baseY + waveY;
        }
      }

      // Draw 3D grid lines with depth
      ctx.lineWidth = 0.5;

      // Horizontal lines
      for (let i = 0; i < rows - 1; i++) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(0, 180, 216, 0.03)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 180, 216, 0.03)');
        ctx.strokeStyle = gradient;

        for (let j = 0; j < cols - 1; j++) {
          const node = gridNodes[i][j];
          const nextNode = gridNodes[i][j + 1];
          if (j === 0) {
            ctx.moveTo(node.x, node.y);
          }
          ctx.lineTo(nextNode.x, nextNode.y);
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let j = 0; j < cols - 1; j++) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 180, 216, 0.03)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 180, 216, 0.03)');
        ctx.strokeStyle = gradient;

        for (let i = 0; i < rows - 1; i++) {
          const node = gridNodes[i][j];
          const nextNode = gridNodes[i + 1][j];
          if (i === 0) {
            ctx.moveTo(node.x, node.y);
          }
          ctx.lineTo(nextNode.x, nextNode.y);
        }
        ctx.stroke();
      }

      // Draw fiber optic trails
      for (let i = 0; i < fiberTrails.length; i++) {
        const trail = fiberTrails[i];
        trail.progress += trail.speed;
        
        if (trail.progress > 1.5) {
          fiberTrails[i] = createFiberTrail();
          fiberTrails[i].progress = -0.2;
          continue;
        }

        if (trail.progress < 0) continue;

        const rgb = trail.color === colors.atlasBlue ? colors.atlasBlueRGB : colors.cyanRGB;
        const startPos = trail.progress - trail.length / 2;
        const endPos = trail.progress + trail.length / 2;

        const gradient = ctx.createLinearGradient(
          trail.isHorizontal ? startPos * canvas.width : 0,
          trail.isHorizontal ? 0 : startPos * canvas.height,
          trail.isHorizontal ? endPos * canvas.width : 0,
          trail.isHorizontal ? 0 : endPos * canvas.height
        );

        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${trail.opacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${trail.opacity})`);
        gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${trail.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = trail.color;
        ctx.shadowBlur = 10;

        if (trail.isHorizontal && trail.lineIndex < rows) {
          const y = gridNodes[trail.lineIndex]?.[0]?.y || trail.lineIndex * GRID_SIZE;
          ctx.moveTo(Math.max(0, startPos * canvas.width), y);
          ctx.lineTo(Math.min(canvas.width, endPos * canvas.width), y);
        } else if (!trail.isHorizontal && trail.lineIndex < cols) {
          const x = gridNodes[0]?.[trail.lineIndex]?.x || trail.lineIndex * GRID_SIZE;
          ctx.moveTo(x, Math.max(0, startPos * canvas.height));
          ctx.lineTo(x, Math.min(canvas.height, endPos * canvas.height));
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw and update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;

      // Draw connection lines between nearby particles
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = 0.1 * (1 - dist / 100);
            ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw pulsing glow nodes at intersections
      const pulseTime = Math.sin(time * 0.02) * 0.5 + 0.5;
      for (let i = 0; i < rows - 1; i += 4) {
        for (let j = 0; j < cols - 1; j += 4) {
          const node = gridNodes[i][j];
          const distance = Math.sqrt(
            Math.pow(node.x - canvas.width / 2, 2) + 
            Math.pow(node.y - canvas.height / 2, 2)
          );
          
          if (distance < 400) {
            const intensity = (1 - distance / 400) * pulseTime * 0.15;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 170, ${intensity})`;
            ctx.shadowColor = colors.cyan;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: '#0A0D14' }}
    />
  );
}
