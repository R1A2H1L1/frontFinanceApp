'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BrandPanel, Alert, PasswordInput, Spinner } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ correo, contrasena });
      if (res.status === 200 && res.data) {
        setSession(res.data);
        router.push('/dashboard');
      } else {
        setError(res.mensaje || 'Correo o contraseña incorrectos.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <BrandPanel />
      <main className="auth-panel--form">
        <div className="form-card">
          <header className="form-header">
            <p className="form-eyebrow">Acceso seguro</p>
            <h2 className="form-title">Bienvenido<br />de vuelta</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar.</p>
          </header>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field-label">Correo electrónico</label>
              <input
                type="email"
                className="field-input"
                placeholder="usuario@ejemplo.com"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <PasswordInput
                placeholder="••••••••"
                value={contrasena}
                onChange={e => setContrasena((e.target as HTMLInputElement).value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? <Spinner /> : null}
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="form-footer">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="btn btn--link">Regístrate aquí</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
