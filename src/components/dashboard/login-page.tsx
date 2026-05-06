'use client';

import { useState } from 'react';
import { useAuthStore, IS_DEV_MODE } from '@/lib/auth-store';
import { Eye, EyeOff, Loader2, Lock, Mail, Terminal, UserPlus, LogIn, User, Phone, MessageCircle, ArrowRight, Shield, Zap, Globe, Wallet, ArrowDownUp, TrendingUp } from 'lucide-react';
import { Logo3D } from '@/components/ui/logo-3d';
import CyberGridBackground from './cyber-grid-background';

/* ─── Login / Register Page with Split Layout ─── */
export default function LoginPage() {
  const { login, register, isLoading, loginError, registerError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Registration form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');

  const error = mode === 'login' ? loginError : registerError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) return;

    if (mode === 'register') {
      if (password.length < 8) {
        setLocalError('A palavra-passe deve ter pelo menos 8 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('As palavras-passe não coincidem.');
        return;
      }
      if (!fullName.trim()) {
        setLocalError('O nome completo é obrigatório.');
        return;
      }
      if (!phone.trim()) {
        setLocalError('O número de telefone é obrigatório.');
        return;
      }

      await register(email, password, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        telegram: telegram.trim() || undefined,
      });
    } else {
      await login(email, password);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setLocalError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setFullName('');
    setPhone('');
    setTelegram('');
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Cyber-Grid Background */}
      <CyberGridBackground />

      {/* ═══════════════════════════════════════════════════════
          LEFT SIDE - Welcome Content
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center items-start p-12 xl:p-20 relative z-10">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.03) 0%, transparent 50%, rgba(0, 180, 216, 0.02) 100%)'
          }}
        />

        {/* Logo */}
        <div className="relative mb-10 animate-fade-up">
          <Logo3D size="xl" spin showRing />
        </div>

        {/* Title */}
        <div className="relative mb-8 animate-fade-up-1">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-white">Bem-vindo à</span>
            <br />
            <span className="neon-glow" style={{ color: '#00D4AA' }}>Plataforma do Futuro</span>
          </h1>
          <p className="mt-4 text-lg xl:text-xl" style={{ color: '#A0A0A0' }}>
            Gestão inteligente dos seus ativos financeiros
          </p>
        </div>

        {/* Features */}
        <div className="relative space-y-6 animate-fade-up-2">
          {[
            { icon: Wallet, title: 'Tesouraria Multi-Moeda', desc: 'Gerencie EUR, USD, BRL, USDT em um só lugar' },
            { icon: ArrowDownUp, title: 'Câmbio Instantâneo', desc: 'Conversão automática com as melhores taxas' },
            { icon: TrendingUp, title: 'Liquidação em Tempo Real', desc: 'Receba pagamentos de 120+ países' },
            { icon: Shield, title: 'Segurança Bancária', desc: 'Encriptação TLS 1.3 · Compliance PSD2' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 180, 216, 0.05))',
                  border: '1px solid rgba(0, 212, 170, 0.15)'
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: '#00D4AA' }} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">{feature.title}</h3>
                <p className="text-sm" style={{ color: '#707070' }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative mt-12 pt-8 border-t animate-fade-up-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="grid grid-cols-3 gap-8">
            {[
              { val: '€2.5B+', label: 'Processados' },
              { val: '120+', label: 'Países' },
              { val: '99.9%', label: 'Uptime' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl xl:text-3xl font-bold" style={{ color: '#00D4AA' }}>{stat.val}</div>
                <div className="nex-mono text-xs uppercase tracking-wider mt-1" style={{ color: '#606060' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dev Badge */}
        {IS_DEV_MODE && (
          <div className="absolute top-8 left-8 dev-badge">
            <Terminal className="w-3 h-3" />
            DEV BYPASS
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT SIDE - Login/Register Form
          ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 relative z-10">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <Logo3D size="md" spin showRing={false} />
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Atlas</span>{' '}
              <span style={{ color: '#00D4AA' }}>GP</span>
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div 
          className="w-full max-w-md animate-fade-up"
          style={{ marginTop: '100px' }}
        >
          <div 
            className="glass-panel p-6 sm:p-8 rounded-2xl"
            style={{ background: 'rgba(10, 13, 20, 0.9)' }}
          >
            {/* Mode toggle */}
            <div 
              className="flex mb-6 rounded-xl overflow-hidden" 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all nex-mono rounded-l-xl ${
                  mode === 'login'
                    ? 'text-[#080a0f]'
                    : 'text-[#606060] hover:text-[#A0A0A0]'
                }`}
                style={mode === 'login' ? { background: 'linear-gradient(135deg, #00D4AA, #00B4D8)' } : {}}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all nex-mono rounded-r-xl ${
                  mode === 'register'
                    ? 'text-[#080a0f]'
                    : 'text-[#606060] hover:text-[#A0A0A0]'
                }`}
                style={mode === 'register' ? { background: 'linear-gradient(135deg, #00D4AA, #00B4D8)' } : {}}
              >
                <UserPlus className="w-4 h-4" />
                Registo
              </button>
            </div>

            <div className="nex-mono text-[10px] uppercase tracking-widest mb-6" style={{ color: '#606060' }}>
              {mode === 'login' ? 'Autenticação de Acesso' : 'Criar Nova Conta'}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                      placeholder="João Silva"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                    placeholder="utilizador@empresa.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Phone Number (register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                    Número de Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                      placeholder="+351 912 345 678"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Telegram Username (register only - optional) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                    Username Telegram <span style={{ color: '#606060' }}>(opcional)</span>
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                      placeholder="@utilizador"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

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
                    placeholder="••••••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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

              {/* Confirm Password (register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="nex-mono text-[11px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                    Confirmar Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="neon-input w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {(error || localError) && (
                <div
                  className="animate-fade-up rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(255, 59, 92, 0.08)',
                    border: '1px solid rgba(255, 59, 92, 0.25)',
                    color: '#FF5252',
                  }}
                >
                  {localError || error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !email || !password || (mode === 'register' && (!confirmPassword || !fullName || !phone))}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                  color: '#080a0f',
                  boxShadow: '0 0 20px rgba(0, 212, 170, 0.25)'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'A autenticar...' : 'A criar conta...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Secure notice */}
            <div className="mt-6 flex items-center justify-center gap-2 nex-mono text-[10px]" style={{ color: '#606060' }}>
              <Shield className="w-3 h-3" />
              Ligação encriptada TLS 1.3 · AES-256-GCM
            </div>

            {IS_DEV_MODE && (
              <div className="mt-3 flex items-center justify-center gap-1.5 nex-mono text-[10px]" style={{ color: '#FFB800' }}>
                <Terminal className="w-3 h-3" />
                Dev bypass ativo — qualquer credencial aceite
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-center animate-fade-up-3">
            <p className="nex-mono text-[10px] mb-2" style={{ color: '#606060' }}>Precisa de ajuda?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:support@atlasglobal.digital"
                className="nex-mono text-[11px] transition-colors hover:text-[#00D4AA]"
                style={{ color: '#A0A0A0' }}
              >
                support@atlasglobal.digital
              </a>
              <span style={{ color: '#606060' }}>·</span>
              <a
                href="https://t.me/AtlasCore_Support"
                target="_blank"
                rel="noopener noreferrer"
                className="nex-mono text-[11px] transition-colors hover:text-[#00D4AA]"
                style={{ color: '#A0A0A0' }}
              >
                @AtlasCore_Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
