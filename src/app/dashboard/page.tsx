'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, CategoriaData, HistorialData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Alert, PasswordInput, LogoMark, Spinner } from '@/components/ui';

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const formatDT = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

const nowLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout } = useAuth();

  // — Profile state —
  const [descripcion, setDescripcion] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [descLoading, setDescLoading] = useState(false);
  const [descError, setDescError] = useState('');
  const [descSuccess, setDescSuccess] = useState('');
  const [savedDesc, setSavedDesc] = useState('');

  // — Transaction form state —
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [txCatId, setTxCatId] = useState<number | ''>('');
  const [txNombre, setTxNombre] = useState('');
  const [txMonto, setTxMonto] = useState('');
  const [txFecha, setTxFecha] = useState(nowLocal);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState('');
  const [txSuccess, setTxSuccess] = useState('');

  // — History state —
  const [historial, setHistorial] = useState<HistorialData | null>(null);
  const [histPage, setHistPage] = useState(0);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    if (!session) { router.replace('/login'); return; }
    setSavedDesc(session.usuario.cliente.descripcion || '');
    setDescripcion(session.usuario.cliente.descripcion || '');

    const token = session.accessToken;
    api.categorias(token).then(r => {
      if (r.status === 200 && r.data) setCategorias(r.data);
    });
    api.historial(token, 0).then(r => {
      if (r.status === 200 && r.data) setHistorial(r.data);
    });
  }, [session, router]);

  if (!session) return null;

  const { usuario } = session;
  const { cliente } = usuario;
  const selectedCat = categorias.find(c => c.idCategoria === txCatId);

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

  async function handleTransaccion(e: FormEvent) {
    e.preventDefault();
    if (txCatId === '') { setTxError('Selecciona una categoría.'); return; }
    if (!txNombre.trim()) { setTxError('Ingresa un nombre para la transacción.'); return; }
    const monto = parseFloat(txMonto);
    if (!txMonto || isNaN(monto) || monto <= 0.01) {
      setTxError('El monto debe ser mayor a $0.01.');
      return;
    }
    if (!selectedCat) return;

    setTxError('');
    setTxSuccess('');
    setTxLoading(true);
    try {
      const fecha = txFecha.length === 16 ? `${txFecha}:00` : txFecha;
      const res = await api.registrarTransaccion(session.accessToken, {
        nombre: txNombre.trim(),
        monto,
        movimientoEn: fecha,
        tipo: selectedCat.tipo,
        idCategoria: selectedCat.idCategoria,
      });
      if (res.status === 200) {
        setTxSuccess('Transacción registrada exitosamente.');
        setTxNombre('');
        setTxMonto('');
        setTxFecha(nowLocal());
        setTxCatId('');
        const hist = await api.historial(session.accessToken, 0);
        if (hist.status === 200 && hist.data) {
          setHistorial(hist.data);
          setHistPage(0);
        }
        setTimeout(() => setTxSuccess(''), 4000);
      } else {
        setTxError(res.mensaje || 'No se pudo registrar la transacción.');
      }
    } catch {
      setTxError('No se pudo conectar con el servidor.');
    } finally {
      setTxLoading(false);
    }
  }

  async function handlePage(dir: 1 | -1) {
    const next = histPage + dir;
    if (next < 0 || (historial && next >= historial.totalPaginas)) return;
    setHistLoading(true);
    try {
      const res = await api.historial(session.accessToken, next);
      if (res.status === 200 && res.data) {
        setHistorial(res.data);
        setHistPage(next);
      }
    } finally {
      setHistLoading(false);
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

        {/* ── Transactions divider ── */}
        <div className="tx-section-divider" />

        {/* Balance stats */}
        <div className="tx-stats">
          <div className="tx-stat">
            <div className="tx-stat-label">Balance actual</div>
            <div className={`tx-stat-value ${(historial?.balanceActual ?? 0) >= 0 ? 'tx-stat-value--ingreso' : 'tx-stat-value--gasto'}`}>
              {formatCOP(historial?.balanceActual ?? 0)}
            </div>
          </div>
          <div className="tx-stat">
            <div className="tx-stat-label">Total ingresos</div>
            <div className="tx-stat-value tx-stat-value--ingreso">
              {formatCOP(historial?.totalIngresos ?? 0)}
            </div>
          </div>
          <div className="tx-stat">
            <div className="tx-stat-label">Total gastos</div>
            <div className="tx-stat-value tx-stat-value--gasto">
              {formatCOP(historial?.totalGastos ?? 0)}
            </div>
          </div>
        </div>

        {/* Nueva transacción */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Nueva transacción</span>
            {selectedCat && (
              <span className={`tipo-badge tipo-badge--${selectedCat.tipo.toLowerCase()}`}>
                {selectedCat.tipo === 'INGRESO' ? '+ Ingreso' : '− Gasto'}
              </span>
            )}
          </div>

          {txError && <Alert type="error">{txError}</Alert>}
          {txSuccess && <Alert type="success">{txSuccess}</Alert>}

          <form onSubmit={handleTransaccion} noValidate>
            <div className="field">
              <label className="field-label">Categoría</label>
              <select
                className="field-input field-select"
                value={txCatId}
                onChange={e => setTxCatId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecciona una categoría…</option>
                {categorias.filter(c => c.tipo === 'INGRESO').length > 0 && (
                  <optgroup label="Ingresos">
                    {categorias.filter(c => c.tipo === 'INGRESO').map(c => (
                      <option key={c.idCategoria} value={c.idCategoria}>
                        {c.icono} {c.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}
                {categorias.filter(c => c.tipo === 'GASTO').length > 0 && (
                  <optgroup label="Gastos">
                    {categorias.filter(c => c.tipo === 'GASTO').map(c => (
                      <option key={c.idCategoria} value={c.idCategoria}>
                        {c.icono} {c.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Nombre / Concepto</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: Salario abril"
                value={txNombre}
                onChange={e => setTxNombre(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Monto (COP)</label>
                <input
                  type="number"
                  min="0.02"
                  step="any"
                  className="field-input"
                  placeholder="0"
                  value={txMonto}
                  onChange={e => setTxMonto(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Fecha y hora</label>
                <input
                  type="datetime-local"
                  className="field-input"
                  value={txFecha}
                  onChange={e => setTxFecha(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={txLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {txLoading ? <Spinner /> : null}
              {txLoading ? 'Registrando...' : 'Registrar transacción'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Historial de transacciones</span>
            {historial && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                {historial.totalElementos} movimiento{historial.totalElementos !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {histLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spinner />
            </div>
          )}

          {!histLoading && historial?.transacciones.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 0',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
            }}>
              Sin movimientos aún. Registra tu primera transacción.
            </div>
          )}

          {!histLoading && historial && historial.transacciones.length > 0 && (
            <>
              <div className="tx-list">
                {historial.transacciones.map(tx => (
                  <div key={tx.id} className="tx-item">
                    <div className="tx-icon">{tx.iconoCategoria}</div>
                    <div className="tx-info">
                      <div className="tx-name">{tx.nombre || tx.nombreCategoria}</div>
                      <div className="tx-meta">{tx.nombreCategoria} · {formatDT(tx.movimientoEn)}</div>
                    </div>
                    <div className={`tx-amount tx-amount--${tx.tipo.toLowerCase()}`}>
                      {tx.tipo === 'INGRESO' ? '+' : '−'}{formatCOP(tx.monto)}
                    </div>
                  </div>
                ))}
              </div>

              {historial.totalPaginas > 1 && (
                <div className="tx-pagination">
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => handlePage(-1)}
                    disabled={histPage === 0}
                  >
                    ← Anterior
                  </button>
                  <span className="tx-page-info">
                    {histPage + 1} / {historial.totalPaginas}
                  </span>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => handlePage(1)}
                    disabled={histPage >= historial.totalPaginas - 1}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
