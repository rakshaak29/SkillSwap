import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      setShowSplash(true);
      setTimeout(() => navigate('/'), 2200);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: '#0a0a0a', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '25%', left: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', animation: 'authOrb1 4s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', animation: 'authOrb2 5s ease-in-out infinite alternate' }} />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 800, color: '#f0f0f0', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, animation: 'splashEntrance 0.8s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
          <span style={{ fontSize: '4rem' }}>⚡</span> SkillSwap
        </div>
        <div style={{ zIndex: 1, color: '#a0a0a0', fontSize: '1.1rem', animation: 'fadeIn 1s ease-in 0.4s both' }}>
          Preparing your dashboard...
        </div>
        <div style={{ zIndex: 1, marginTop: 16, animation: 'fadeIn 1s ease-in 0.8s both' }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
        <div style={{ position: 'absolute', bottom: '12%', zIndex: 1, display: 'flex', gap: 32, animation: 'fadeIn 1s ease-in 1s both' }}>
          {['🎓 Learn', '🏫 Teach', '🤝 Connect', '🚀 Grow'].map(t => (
            <span key={t} style={{ fontSize: '0.875rem', color: 'rgba(160,160,160,0.6)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span style={{ fontSize: '1.5rem', marginRight: 8 }}>⚡</span>SkillSwap</div>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>

        {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-link">Don't have an account? <Link to="/register">Create one</Link></div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Quick Start:</strong><br />
          Register a new account to get started. Demo teachers are pre-loaded in the Find Teachers page.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
