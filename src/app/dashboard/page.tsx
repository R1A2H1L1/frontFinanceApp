'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Alert, PasswordInput, LogoMark, Spinner } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [descripcion, setDescripcion] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [descLoading, setDescLoading] = useState(false);
  const [descError, setDescError] = useState('');
  const [descSuccess, setDescSuccess] = useState('');
  const [savedDesc, setSavedDesc] = useState('');

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    setSavedDesc(session.usuario.cliente.descripcion || '');
    setDescripcion(session.usuario.cliente.descripcion || '');
  }, [session, router]);

  if (!session) return null;

  const { usuario } = session;
  const { cliente } = usuario;

  async function handleDescripcion(e: FormEvent) {
    e.preventDefault();
    if (!contrasena) { setDescError('Ingresa tu contraseña para guardar.'); return; }
    setDescError('');
    setDescSuccess('');
    setDescLoading(true);
    try {
      const res = await api.descripcion({ correo: usuario.correo, contrasena, descripcion });
      if (res.status === 200 && res.data) {
        setSavedDesc(res.data.descripcion);
        setDescSuccess('Descripción guardada correctamente.');
        setContrasena('');
        setTimeout(() => setDescSuccess(''), 4000);
      } else {
        setDescError(res.mensaje || 'No se pudo guardar la descripción.');
      }
    } catch {
      setDescError('No se pudo conectar con el servidor.');
    } finally {
      setDescLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="dashboard">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-brand">
          <LogoMark size={24} />
          <span className="brand-logo-text">Finance App</span>
        </div>
        <div className="topbar-user">
          <span className="topbar-email">{usuario.correo}</span>
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome-title">
            Hola, <em>{cliente.nombre || usuario.correo.split('@')[0]}</em>
          </h1>
          <p className="dashboard-welcome-sub">
            Gestiona tu perfil y configuración financiera desde aquí.
          </p>
        </div>

        {/* Profile cards */}
        <div className="profile-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Estado de cuenta</span>
              <span className="card-badge card-badge--active">● {usuario.estado}</span>
            </div>
            <div className="profile-value">{cliente.nombre || '—'}</div>
            <div className="profile-label">Nombre registrado</div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Información</span>
            </div>
            <div className="profile-value" style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {usuario.correo}
            </div>
            <div className="profile-label">Correo electrónico · ID #{cliente.idCliente}</div>
          </div>
        </div>

        {/* Description card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Descripción de perfil</span>
          </div>

          {savedDesc && (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              fontStyle: 'italic'
            }}>
              &ldquo;{savedDesc}&rdquo;
            </div>
          )}

          {descError && <Alert type="error">{descError}</Alert>}
          {descSuccess && <Alert type="success">{descSuccess}</Alert>}

          <form onSubmit={handleDescripcion} noValidate>
            <div className="field">
              <label className="field-label">Nueva descripción</label>
              <textarea
                className="textarea-field"
                placeholder="Cuéntanos sobre ti y tus metas financieras..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="field">
              <label className="field-label">Confirmar con contraseña</label>
              <PasswordInput
                placeholder="Tu contraseña actual"
                value={contrasena}
                onChange={e => setContrasena((e.target as HTMLInputElement).value)}
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={descLoading || !descripcion.trim()}
                style={{ flex: 1 }}
              >
                {descLoading ? <Spinner /> : null}
                {descLoading ? 'Guardando...' : 'Guardar descripción'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
