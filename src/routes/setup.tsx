import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '../assets/login-logo.png';
import '../features/auth/auth.css';

export const Route = createFileRoute('/setup')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'First-time setup — Waypoint' },
      { name: 'description', content: 'Create the first Waypoint administrator account.' },
      { property: 'og:title', content: 'First-time setup — Waypoint' },
      { property: 'og:description', content: 'Create the first Waypoint administrator account.' },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setBusy(false);
    if (err) return setError(err.message);
    if (data.session) window.location.href = '/';
    else setDone(true);
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="setup-title">
        <a className="login-brand" href="/login" aria-label="Waypoint sign in"><img src={logoImg} alt="" /></a>
        <div className="login-content">
          <div className="login-heading">
            <h1 id="setup-title">Create administrator</h1>
            <p>The first account created becomes the Waypoint administrator. Everyone else is added from the Users screen.</p>
          </div>
          {done ? (
            <p className="reset-help" role="status">Check your inbox to confirm your email, then <a href="/login">sign in</a>.</p>
          ) : (
            <form className="login-form" onSubmit={submit}>
              <label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button type="submit" className="btn btn-primary login-button" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
