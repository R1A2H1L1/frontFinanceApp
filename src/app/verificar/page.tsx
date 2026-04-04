'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BrandPanel, Alert, OTPInput, Spinner } from '@/components/ui';

export default function VerificarPage() {
  const router = useRouter();
  const { pendingEmail } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const correo = pendingEmail;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (codigo.length < 6) { setError('Ingresa el código completo de 6 dígitos.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.verificar({ correo, codigo });
      if (res.status === 201) {
        setSuccess('¡Correo verificado! Redirigiendo...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(res.mensaje || 'Código incorrecto o expirado.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!correo) return;
    setResending(true);
    setError('');
    try {
      const res = await api.reenviarCodigo(correo);
      if (res.status === 200) {
        setSuccess('Código reenviado. Revisa tu correo.');
        setCodigo('');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.mensaje || 'Error al reenviar el código.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-shell">
      <BrandPanel />
      <main className="auth-panel--form">
        <div className="form-card" style={{ textAlign: 'center' }}>
          <header className="form-header" style={{ textAlign: 'left' }}>
            <p className="form-eyebrow">Verificación</p>
            <h2 className="form-title">Revisa tu<br />correo</h2>
            <p className="form-subtitle">
              Enviamos un código de 6 dígitos a{' '}
              <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {correo || 'tu correo'}
              </span>
            </p>
          </header>

          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '0.5rem' }}>
              <label className="field-label" style={{ display: 'block', textAlign: 'left' }}>Código de verificación</label>
              <OTPInput value={codigo} onChange={setCodigo} />
            </div>

            <button type="submit" className="btn btn--primary" disabled={loading || codigo.length < 6}>
              {loading ? <Spinner /> : null}
              {loading ? 'Verificando...' : 'Verificar cuenta'}
            </button>
          </form>

          <div className="divider">o</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ¿No llegó el código?
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleResend}
              disabled={resending || !correo}
            >
              {resending ? <Spinner /> : null}
              {resending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
