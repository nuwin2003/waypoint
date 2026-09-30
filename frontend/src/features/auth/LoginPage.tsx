import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth/AuthContext';
import { api } from '../../api';
import logoImg from '../../assets/logo.png';
import './auth.css';

const rolePaths: Record<string, string> = {
  DISPATCHER: '/dispatch',
  STOREKEEPER: '/store',
  LOADER: '/load',
  DRIVER: '/drive',
};

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      setUser({
        email: res.email,
        displayName: res.displayName || 'Waypoint User',
        role: res.role,
        accessToken: res.accessToken,
      });
      navigate(rolePaths[res.role] || '/dispatch', { replace: true });
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
    <div className="login-page">
      <div className="login-art">
        <div className="login-brand">
          <img src={logoImg} alt="Waypoint" />
        </div>
        <div className="login-art-copy">
          <span className="login-eyebrow">Next-Gen Distribution Logistics</span>
          <h1>Smart Route &amp; Fleet Management</h1>
          <p>Real-time route planning, multi-temperature loading verification, store receiving, and driver telemetry - all in one unified control system.</p>
        </div>
        <div className="login-art-footer">
          <span>© 2026 Waypoint Logistics</span>
          <span>v2.4.0 · Enterprise Edition</span>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-heading">
          <h2>Sign in to Waypoint</h2>
          <p>Enter your account credentials to continue.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="login-error" role="alert">{error}</div>}
          <label>
            Email Address
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="user@waypoint.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary login-button" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="login-help">Protected by Enterprise Security · SSL Encrypted Session</div>
      </div>
    </div>
  );
}
