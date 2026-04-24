'use client';

import { useState, useEffect } from 'react';
import { api, users } from '@/lib/api/client';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Shield, Bell, Loader2, CheckCircle, Key } from 'lucide-react';

export default function SettingsSecurity() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
          <Shield className="w-5 h-5" style={{ color: '#00D4AA' }} />
          Definições e Segurança
        </h3>
        <p className="nex-mono text-xs" style={{ color: '#606060' }}>
          Gerir conta, segurança e preferências de notificação.
        </p>
      </div>

      <Tabs defaultValue="password">
        <TabsList className="glass-panel p-1 h-auto w-full grid grid-cols-4" style={{ background: 'rgba(14,19,27,0.65)' }}>
          {[
            { value: 'password', label: 'Palavra-passe', icon: Key },
            { value: 'email', label: 'Email', icon: Mail },
            { value: '2fa', label: '2FA', icon: Shield },
            { value: 'notifications', label: 'Notificações', icon: Bell },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:text-[#00D4AA] data-[state=active]:bg-[rgba(0,212,170,0.08)] text-[#A0A0A0] nex-mono text-[10px] rounded-md px-2 py-2.5 transition-all flex items-center justify-center gap-1.5"
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="password" className="mt-4">
          <PasswordTab />
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <EmailTab />
        </TabsContent>

        <TabsContent value="2fa" className="mt-4">
          <TwoFATab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Password Tab ─── */
function PasswordTab() {
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPass !== confirm) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (newPass.length < 8) {
      setError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      // Use Supabase to update password (JWKS authentication)
      const { error: supabaseError } = await supabase.auth.updateUser({ password: newPass });
      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }
      setSuccess('Palavra-passe alterada com sucesso!');
      setNewPass('');
      setConfirm('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar palavra-passe.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Lock className="w-4 h-4" style={{ color: '#FFB800' }} />
        Alterar Palavra-passe
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Nova Palavra-passe
          </Label>
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="neon-input w-full rounded-lg px-4 py-3 text-sm" required minLength={8} />
        </div>
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Confirmar Nova Palavra-passe
          </Label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="neon-input w-full rounded-lg px-4 py-3 text-sm" required />
        </div>
        {error && (
          <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', color: '#FF5252' }}>{error}</div>
        )}
        {success && (
          <div className="p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA' }}>
            <CheckCircle className="w-4 h-4" />{success}
          </div>
        )}
        <button type="submit" disabled={loading} className="neon-btn-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Alterar Palavra-passe
        </button>
      </form>
    </div>
  );
}

/* ─── Email Tab ─── */
function EmailTab() {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.settings.updateEmail({ email });
      setSuccess('Email atualizado com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Mail className="w-4 h-4" style={{ color: '#00B4D8' }} />
        Gestão de Email
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>Email Atual</Label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="neon-input w-full rounded-lg px-4 py-3 text-sm" required />
        </div>
        {error && <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', color: '#FF5252' }}>{error}</div>}
        {success && <div className="p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA' }}><CheckCircle className="w-4 h-4" />{success}</div>}
        <button type="submit" disabled={loading} className="neon-btn-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Atualizar Email
        </button>
      </form>
    </div>
  );
}

/* ─── 2FA Tab ─── */
function TwoFATab() {
  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Shield className="w-4 h-4" style={{ color: '#A855F7' }} />
        Autenticação de Dois Fatores
      </h4>
      <div
        className="p-4 rounded-lg"
        style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)' }}
      >
        <div className="flex items-start gap-3">
          <Shield className="w-8 h-8 mt-0.5" style={{ color: '#A855F7', opacity: 0.6 }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>Em Breve</p>
            <p className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>
              A autenticação de dois fatores (TOTP) será disponibilizada em breve. Proteja a sua conta com uma camada extra de segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Tab ─── */
function NotificationsTab() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [notifs, setNotifs] = useState({
    email_notifications: false,
    transaction_alerts: false,
    weekly_reports: false,
    security_alerts: false,
  });

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    users.getMe()
      .then((profile) => {
        if (cancelled) return;
        // API client unwraps { data: ... }, so profile is the inner UserMeResponse object directly
        const settings = profile?.settings;
        if (settings) {
          setNotifs({
            email_notifications: !!settings.email_notifications,
            transaction_alerts: !!settings.transaction_alerts,
            weekly_reports: !!settings.weekly_reports,
            security_alerts: !!settings.security_alerts,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, []);

  const handleToggle = (key: string) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    try {
      await api.users.updateMe(notifs);
      setSuccess('Preferências de notificação guardadas!');
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: 'email_notifications', label: 'Notificações por Email', desc: 'Receber alertas por email sobre a conta.' },
    { key: 'transaction_alerts', label: 'Alertas de Transação', desc: 'Notificação para cada transação efetuada.' },
    { key: 'weekly_reports', label: 'Relatórios Semanais', desc: 'Resumo semanal da atividade da conta.' },
    { key: 'security_alerts', label: 'Alertas de Segurança', desc: 'Notificações de login e alterações de segurança.' },
  ];

  if (fetching) {
    return (
      <div className="glass-panel p-6">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Bell className="w-4 h-4" style={{ color: '#FFB800' }} />
        Preferências de Notificação
      </h4>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{item.label}</p>
              <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{item.desc}</p>
            </div>
            <Switch
              checked={notifs[item.key as keyof typeof notifs] as boolean}
              onCheckedChange={() => handleToggle(item.key)}
            />
          </div>
        ))}
        {success && (
          <div className="p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA' }}>
            <CheckCircle className="w-4 h-4" />{success}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          className="neon-btn-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          Guardar Preferências
        </button>
      </div>
    </div>
  );
}
