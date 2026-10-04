import { useNavigate } from '@/lib/router-compat';
import { Globe, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../../app/auth/AuthContext';

export function DriverProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.displayName || 'Driver';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR';

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <p className="dv-eyebrow">Account</p>
      <h1 className="dv-title">Profile</h1>
      <p className="dv-subhead">Sign-in and language for this account.</p>

      <section className="dv-profile-hero" aria-label="Driver">
        <div>
          <p className="dv-profile-name">{name}</p>
          {user?.email && <p className="dv-profile-email">{user.email}</p>}
        </div>
        <div className="dv-profile-ring" aria-hidden>{initials}</div>
      </section>

      <section className="dv-profile-section">
        <h2>Preferences</h2>
        <div className="dv-profile-list">
          <div className="dv-profile-row">
            <Globe size={18} aria-hidden />
            <span className="dv-profile-row-text">
              Language
              <small>English</small>
            </span>
            <span className="dv-profile-badge accent">EN</span>
          </div>
        </div>
      </section>

      <section className="dv-profile-section">
        <h2>Help</h2>
        <div className="dv-profile-list">
          <div className="dv-profile-row">
            <HelpCircle size={18} aria-hidden />
            <span className="dv-profile-row-text">
              Help center
              <small>Call the depot desk if you can&apos;t sign in or a stop can&apos;t be completed.</small>
            </span>
          </div>
        </div>
      </section>

      <button className="dv-profile-signout" type="button" onClick={signOut}>
        <LogOut size={18} aria-hidden />
        Sign out
      </button>
    </div>
  );
}
