'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BrandPanel, Alert, PasswordInput, PasswordStrength, Spinner } from '@/components/ui';

function validate(correo: string, contrasena: string, confirmar: string) {
  if (!correo || !contrasena || !confirmar) return 'Todos los campos son requeridos.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Ingresa un correo válido.';
  if (contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(contrasena)) return 'La contraseña requiere al menos una mayúscula.';
  if (!/[a-z]/.test(contrasena)) return 'La contraseña requiere al menos una minúscula.';
  if (!/[0-9]/.test(contrasena)) return 'La contraseña requiere al menos un número.';
  if (!/[@$!%*?&#._\-]/.test(contrasena)) return 'La contraseña requiere un carácter especial (@$!%*?&#._-)';
  if (contrasena !== confirmar) return 'Las contraseñas no coinciden.';
  return '';
}

export default function RegistroPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate(correo, contrasena, confirmar);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.registro({ correo, contrasena, confirmarContrasena: confirmar });
      if (res.status === 200) {
        setPendingEmail(correo);
        router.push('/verificar');
      } else {
        setError(res.mensaje || 'Error al registrarse.');
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
            <p className="form-eyebrow">Nueva cuenta</p>
            <h2 className="form-title">Crea tu<br />perfil</h2>
            <p className="form-subtitle">Comienza a gestionar tus finanzas de forma inteligente.</p>
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
                placeholder="Mínimo 8 caracteres"
                value={contrasena}
                onChange={e => setContrasena((e.target as HTMLInputElement).value)}
                required
                autoComplete="new-password"
              />
              <PasswordStrength value={contrasena} />
              <p className="field-hint">Debe incluir mayúscula, número y carácter especial.</p>
            </div>

            <div className="field">
              <label className="field-label">Confirmar contraseña</label>
              <PasswordInput
                placeholder="Repite tu contraseña"
                value={confirmar}
                onChange={e => setConfirmar((e.target as HTMLInputElement).value)}
                required
                autoComplete="new-password"
              />
              {confirmar && contrasena !== confirmar && (
                <p className="field-error">Las contraseñas no coinciden</p>
              )}
              {confirmar && contrasena === confirmar && confirmar.length > 0 && (
                <p className="field-hint" style={{ color: 'var(--green-light)' }}>✓ Las contraseñas coinciden</p>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? <Spinner /> : null}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </form>

          <div className="form-footer">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="btn btn--link">Inicia sesión</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
