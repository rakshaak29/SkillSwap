import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OnboardingPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('learner');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRoleNext = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (user) setUser({ ...user, role: role as any });
    setSaving(false);
    setStep(2);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (user) setUser({ ...user, bio, college });
    setSaving(false);
    setStep(3);
  };

  const roleOptions = [
    { value: 'learner', icon: '🎓', label: 'Learner', desc: 'I want to learn from verified peers' },
    { value: 'teacher', icon: '🏫', label: 'Teacher', desc: 'I want to teach and mentor others' },
    { value: 'both', icon: '⚡', label: 'Both', desc: 'I want to both learn and teach' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? 'var(--text-primary)' : 'var(--bg-elevated)', transition: 'background 0.4s ease' }} />
          ))}
        </div>

        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚡</div>
            <h2 style={{ marginBottom: 8 }}>Welcome to SkillSwap! 👋</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>You're one step away from joining a verified peer learning community.</p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 28, textAlign: 'left' }}>
              {[
                { icon: '✓', text: 'Pass skill exams to become a verified teacher' },
                { icon: '🔍', text: 'Find verified teachers for skills you want' },
                { icon: '💬', text: 'Real-time sessions with AI moderation' },
                { icon: '⭐', text: 'Rate and get rated after sessions' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(1)}>Get Started →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: 8 }}>What's your goal?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Choose how you want to participate on SkillSwap.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {roleOptions.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: role === opt.value ? 'var(--bg-elevated)' : 'var(--bg-input)', border: `1px solid ${role === opt.value ? 'var(--border-strong)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                  <input type="radio" name="role" value={opt.value} checked={role === opt.value} onChange={e => setRole(e.target.value)} style={{ accentColor: 'white' }} />
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleRoleNext} disabled={saving}>
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: 8 }}>Set up your profile</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Tell others who you are.</p>
            <div className="form-group">
              <label className="form-label">College / Institution</label>
              <input className="form-input" placeholder="e.g. MIT, IIT, VIT…" value={college} onChange={e => setCollege(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Short Bio</label>
              <textarea className="form-textarea" style={{ minHeight: 90 }} placeholder="Tell others about your interests and learning goals…" value={bio} onChange={e => setBio(e.target.value)} maxLength={300} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>{bio.length}/300</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleProfileSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Continue →'}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setStep(3)}>Skip</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ marginBottom: 8 }}>You're all set!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Your profile is set up. Here's what to do next:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                { icon: '📚', text: 'Explore skills and take verification exams', action: '/skills', label: 'Go to Skills' },
                { icon: '🔍', text: 'Find verified teachers for skills you want', action: '/match', label: 'Find Teachers' },
                { icon: '👤', text: 'Complete your profile and add learning goals', action: '/profile', label: 'Edit Profile' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'left' }}>{item.text}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(item.action)}>{item.label}</button>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/')}>Go to Dashboard 🚀</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
