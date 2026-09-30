import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserRole, roleHomePath, useAuth } from '../../app/auth/AuthContext';
import { api } from '../../api';
import logoImg from '../../assets/login-logo.png';
import './auth.css';

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetHelp, setResetHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      if (!isUserRole(res.role)) {
        throw new Error('Your account has an unsupported role. Please contact your administrator.');
      }
      setUser({
        email: res.email,
        displayName: res.displayName || 'Waypoint User',
        role: res.role,
        accessToken: res.accessToken,
      });
      navigate(roleHomePath(res.role), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      try {
        const payload = JSON.parse(message) as { detail?: string; message?: string };
        setError(payload.detail || payload.message || 'Unable to sign in. Please try again.');
      } catch {
        setError(message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="login-brand" href="/" aria-label="Waypoint Group home">
          <img src={logoImg} alt="" />
        </a>

        <div className="login-content">
          <div className="login-heading">
            <h1 id="login-title">Welcome back</h1>
            <p>Sign in to continue your delivery day.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
            {error && <div className="login-error" role="alert">{error}</div>}
            <label>
              Email address
              <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.8 5.2 8.8 7a9.8 9.8 0 01-2.5 3.5M6.2 6.3C3.8 7.9 2.4 10.5 2.4 12c0 1.8 3.8 7 9.6 7 1.2 0 2.3-.3 3.3-.7"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.4 12s3.6-7 9.6-7 9.6 7 9.6 7-3.6 7-9.6 7-9.6-7-9.6-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </label>

            <div className="login-form-actions">
              <button className="forgot-password" type="button" onClick={() => setResetHelp((visible) => !visible)} aria-expanded={resetHelp}>
                Forgot password?
              </button>
            </div>
            {resetHelp && <p className="reset-help" role="status">Please contact your Waypoint administrator to reset your password.</p>}

            <button type="submit" className="btn btn-primary login-button" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="login-help">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></svg>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
            <span>Your account is protected.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
