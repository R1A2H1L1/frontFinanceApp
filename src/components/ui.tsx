'use client';
import { useState, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/* ── Eye Icon ── */
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

/* ── Password Input ── */
export function PasswordInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="field-wrap">
      <input type={show ? 'text' : 'password'} className={`field-input field-input--icon ${className}`} {...props} />
      <button type="button" className="field-icon" onClick={() => setShow(v => !v)} tabIndex={-1} aria-label="Mostrar contraseña">
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

/* ── Password Strength ── */
function calcStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[@$!%*?&#._\-]/.test(pw)) s++;
  return s;
}

export function PasswordStrength({ value }: { value: string }) {
  const s = calcStrength(value);
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  return value ? (
    <div>
      <div className="strength-bar">
        {[1,2,3,4].map(i => (
          <div key={i} className={`strength-segment ${s >= i ? `active-${s}` : ''}`} />
        ))}
      </div>
      <div className="field-hint" style={{ marginTop: '0.35rem', color: s >= 3 ? 'var(--green-light)' : s === 2 ? 'var(--gold-dim)' : 'var(--red-light)' }}>
        {labels[s]}
      </div>
    </div>
  ) : null;
}

/* ── Alert ── */
export function Alert({ type, children }: { type: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const icons = {
    error: '✕',
    success: '✓',
    info: '◆',
  };
  return (
    <div className={`alert alert--${type}`}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: '0.1rem', flexShrink: 0 }}>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

/* ── OTP Input ── */
export function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    const input = e.currentTarget;
    if (e.key === 'Backspace' && !input.value && idx > 0) {
      const prev = input.closest('.otp-grid')?.querySelectorAll('.otp-cell')[idx - 1] as HTMLInputElement;
      prev?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = [...digits];
    arr[idx] = v;
    const newVal = arr.join('');
    onChange(newVal);
    if (v && idx < 5) {
      const next = e.target.closest('.otp-grid')?.querySelectorAll('.otp-cell')[idx + 1] as HTMLInputElement;
      next?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) onChange(pasted);
    e.preventDefault();
  };

  return (
    <div className="otp-grid" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          className={`otp-cell${d ? ' otp-cell--filled' : ''}`}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ── Brand Logo Mark ── */
export function LogoMark({ size = 36 }: { size?: number }) {
  const dotSize = size * 0.28;
  return (
    <div style={{ width: size, height: size, border: '1px solid var(--gold-dim)', display: 'grid', placeItems: 'center', transform: 'rotate(45deg)', flexShrink: 0 }}>
      <span style={{ display: 'block', width: dotSize, height: dotSize, background: 'var(--gold)', transform: 'rotate(-45deg)' }} />
    </div>
  );
}

/* ── Brand Panel ── */
export function BrandPanel() {
  return (
    <aside className="auth-panel--brand">
      <div className="brand-noise" />
      <div className="brand-grid" />
      <div className="brand-glow" />

      <div className="brand-logo">
        <LogoMark />
        <span className="brand-logo-text">Finance App</span>
      </div>

      <div className="brand-hero">
        <p className="brand-hero-eyebrow">Gestión financiera</p>
        <h1 className="brand-hero-title">
          Tu dinero,<br /><em>bajo control</em>
        </h1>
        <p className="brand-hero-body">
          Visualiza, analiza y optimiza tus finanzas personales con inteligencia y precisión.
        </p>
      </div>

      <div className="brand-stats">
        {[
          { value: '360°', label: 'Visibilidad' },
          { value: '100%', label: 'Seguro' },
          { value: '24/7', label: 'Disponible' },
        ].map(s => (
          <div key={s.label} className="brand-stat">
            <div className="brand-stat-value">{s.value}</div>
            <div className="brand-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ── Spinner ── */
export function Spinner() {
  return <div className="spinner" />;
}
