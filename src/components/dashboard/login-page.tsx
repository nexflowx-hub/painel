'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore, IS_DEV_MODE } from '@/lib/auth-store';
import { Eye, EyeOff, Loader2, Lock, User, Wifi, Terminal } from 'lucide-react';
import { Logo3D } from '@/components/ui/logo-3d';

/* ─── Canvas particle background ─── */
function FinancialCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#00D4AA', '#00B4D8', '#00D4AA', '#0d7377'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 212, 170, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Connection lines
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 170, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Animated flowing sine wave (financial data flow)
      const time = Date.now() * 0.001;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 212, 170, 0.06)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height * 0.5 + Math.sin(x * 0.005 + time) * 80 + Math.sin(x * 0.01 + time * 1.5) * 40;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height * 0.6 + Math.sin(x * 0.008 + time * 0.7) * 60 + Math.cos(x * 0.003 + time) * 50;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

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
      style={{ background: '#0F1117' }}
    />
  );
}

/* ─── Login Page ─── */
export default function LoginPage() {
  const { login, isLoading, loginError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health?XTransformPort=3001', { signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0F1117' }}>
      <FinancialCanvas />

      {/* Radial glow behind card */}
      <div
        className="absolute z-[1] rounded-full"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-up-1">
          <Logo3D size="lg" spin showRing />
          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[#FFFFFF]">Atlas</span>{' '}
              <span className="text-[#FFFFFF]">Global</span>{' '}
              <span className="neon-glow" style={{ color: '#00D4AA' }}>Payments</span>
            </h1>
          </div>
          <p className="nex-mono text-xs mt-1" style={{ color: '#A0A0A0' }}>
            Global Payments Platform
          </p>
          {IS_DEV_MODE && (
            <div className="dev-badge mt-3">
              <Terminal className="w-3 h-3" />
              DEV BYPASS
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 animate-fade-up-2">
          <div className="nex-mono text-[10px] uppercase tracking-widest mb-6" style={{ color: '#606060' }}>
            Autenticação de Acesso
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                Utilizador
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                  placeholder='username@empresa.com'
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neon-input w-full pl-10 pr-12 py-3 rounded-lg text-sm"
                  placeholder='••••••••••••'
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: '#A0A0A0' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div
                className="animate-fade-up rounded-lg px-4 py-3 text-sm"
                style={{
                  background: 'rgba(255, 59, 92, 0.08)',
                  border: '1px solid rgba(255, 59, 92, 0.25)',
                  color: '#FF5252',
                }}
              >
                {loginError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="neon-btn-primary w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A autenticar...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>
          </form>

          {/* Secure notice / Dev hint */}
          <div className="mt-6 flex items-center justify-center gap-2 nex-mono text-[10px]" style={{ color: '#606060' }}>
            <Lock className="w-3 h-3" />
            Ligação encriptada TLS 1.3 · AES-256-GCM
          </div>
          {IS_DEV_MODE && (
            <div className="mt-3 flex items-center justify-center gap-1.5 nex-mono text-[10px]" style={{ color: '#FFB800' }}>
              <Terminal className="w-3 h-3" />
              Dev bypass ativo — qualquer credencial aceite
            </div>
          )}
        </div>

        {/* Backend status */}
        <div className="animate-fade-up-3 mt-6 flex items-center justify-center gap-2 nex-mono text-[10px]" style={{ color: '#606060' }}>
          <Wifi className="w-3 h-3" />
          Backend:{' '}
          {backendStatus === 'online' && (
            <span className="flex items-center gap-1" style={{ color: '#00D4AA' }}>
              <span className="status-dot active" /> ONLINE
            </span>
          )}
          {backendStatus === 'offline' && (
            <span className="flex items-center gap-1" style={{ color: '#FF5252' }}>
              <span className="status-dot error" /> OFFLINE
            </span>
          )}
          {backendStatus === 'checking' && (
            <span className="flex items-center gap-1" style={{ color: '#FFB800' }}>
              <span className="status-dot warning" /> A VERIFICAR...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
