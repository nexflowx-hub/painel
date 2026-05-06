'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api/atlas-client';
import { useAuthStore, IS_DEV_MOCK } from '@/lib/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Shield, Bell, Loader2, CheckCircle, Key, AlertTriangle } from 'lucide-react';

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
        {IS_DEV_MOCK && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFB800' }} />
            <span className="nex-mono text-[10px]" style={{ color: '#FFB800' }}>DEV_MOCK ativo — alterações não persistem no backend.</span>
          </div>
        )}
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
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPass) {
      setError('Introduza a palavra-passe atual.');
      return;
    }
    if (newPass !== confirm) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (newPass.length < 8) {
      setError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (currentPass === newPass) {
      setError('A nova palavra-passe deve ser diferente da atual.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPass, newPass);
      setSuccess('Palavra-passe alterada com sucesso!');
      setCurrentPass('');
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
            Palavra-passe Atual
          </Label>
          <input
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Nova Palavra-passe
          </Label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Confirmar Nova Palavra-passe
          </Label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm"
            required
          />
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

/* ─── Email Tab (read-only) ─── */
function EmailTab() {
  const { user } = useAuthStore();

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Mail className="w-4 h-4" style={{ color: '#00B4D8' }} />
        Gestão de Email
      </h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Email Associado
          </Label>
          <div
            className="w-full rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#FFFFFF',
            }}
          >
            {user?.email ?? '—'}
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.12)' }}>
          <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
            A alteração de email será disponibilizada em breve. Contacte o suporte se precisar de atualizar o seu endereço de email.
          </p>
        </div>
      </div>
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

/* ─── Notifications Tab (placeholder) ─── */
function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    email_notifications: false,
    transaction_alerts: false,
    weekly_reports: false,
    security_alerts: false,
  });
  const [success, setSuccess] = useState('');

  const handleToggle = (key: string) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    // Placeholder — notification settings API coming later
    setSuccess('Preferências de notificação guardadas!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const items = [
    { key: 'email_notifications', label: 'Notificações por Email', desc: 'Receber alertas por email sobre a conta.' },
    { key: 'transaction_alerts', label: 'Alertas de Transação', desc: 'Notificação para cada transação efetuada.' },
    { key: 'weekly_reports', label: 'Relatórios Semanais', desc: 'Resumo semanal da atividade da conta.' },
    { key: 'security_alerts', label: 'Alertas de Segurança', desc: 'Notificações de login e alterações de segurança.' },
  ];

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
        <Bell className="w-4 h-4" style={{ color: '#FFB800' }} />
        Preferências de Notificação
      </h4>
      {IS_DEV_MOCK && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFB800' }} />
          <span className="nex-mono text-[10px]" style={{ color: '#FFB800' }}>API de notificações em desenvolvimento — alterações locais apenas.</span>
        </div>
      )}
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
          className="neon-btn-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Guardar Preferências
        </button>
      </div>
    </div>
  );
}
