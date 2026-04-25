import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SKILLS } from '../data/mockData';
import { getReviews, type Review } from '../store/appStore';
import { getInitials, formatDate } from '../utils/helpers';

const Stars = ({ rating }: { rating: number }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
  </div>
);

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', college: '', avatarUrl: '', role: 'learner' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [addingOffered, setAddingOffered] = useState(false);
  const [addingWanted, setAddingWanted] = useState(false);
  const [selectedOffered, setSelectedOffered] = useState('');
  const [selectedWanted, setSelectedWanted] = useState('');

  useEffect(() => {
    if (user) {
      setReviews(getReviews(user._id));
      setForm({ name: user.name || '', bio: user.bio || '', college: user.college || '', avatarUrl: user.avatarUrl || '', role: user.role || 'learner' });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    await new Promise(r => setTimeout(r, 500));
    if (user) setUser({ ...user, name: form.name, bio: form.bio, college: form.college, avatarUrl: form.avatarUrl, role: form.role as any });
    setMsg('Profile updated successfully!');
    setEditMode(false);
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return setMsg('Image must be less than 3MB');
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, avatarUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAddOffered = () => {
    if (!selectedOffered || !user) return;
    const skill = SKILLS.find(s => s._id === selectedOffered);
    if (!skill) return;
    const exists = user.skillsOffered.some((s: any) => (s._id || s) === skill._id);
    if (!exists) setUser({ ...user, skillsOffered: [...user.skillsOffered, skill] });
    setAddingOffered(false); setSelectedOffered('');
  };

  const handleAddWanted = () => {
    if (!selectedWanted || !user) return;
    const skill = SKILLS.find(s => s._id === selectedWanted);
    if (!skill) return;
    const exists = user.skillsWanted.some((s: any) => (s._id || s) === skill._id);
    if (!exists) setUser({ ...user, skillsWanted: [...user.skillsWanted, skill] });
    setAddingWanted(false); setSelectedWanted('');
  };

  const handleRemoveOffered = (id: string) => {
    if (!user) return;
    setUser({ ...user, skillsOffered: user.skillsOffered.filter((s: any) => (s._id || s) !== id) });
  };

  const handleRemoveWanted = (id: string) => {
    if (!user) return;
    setUser({ ...user, skillsWanted: user.skillsWanted.filter((s: any) => (s._id || s) !== id) });
  };

  if (!user) return <div className="loading-screen"><div className="spinner" /></div>;
  const offeredIds = user.skillsOffered.map((s: any) => s._id || s);
  const wantedIds = user.skillsWanted.map((s: any) => s._id || s);
  const availableForOffered = SKILLS.filter(s => !offeredIds.includes(s._id));
  const availableForWanted = SKILLS.filter(s => !wantedIds.includes(s._id));

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <h1 style={{ marginBottom: 28 }}>My Profile</h1>
      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar avatar-xl" style={{ border: '2px solid var(--border-default)', flexShrink: 0 }}>
            {(user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')))
              ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span>{getInitials(user.name)}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {editMode ? (
              <>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">College</label><input className="form-input" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" style={{ minHeight: 72 }} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell others about yourself..." /></div>
                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" style={{ padding: '8px 12px', fontSize: '0.8rem' }} />
                  <input className="form-input" style={{ marginTop: 8 }} value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} placeholder="Or paste image URL: https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="learner">🎓 Learner</option>
                    <option value="teacher">🏫 Teacher</option>
                    <option value="both">⚡ Both</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                  <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: '1.375rem' }}>{user.name}</h2>
                  <span className="badge badge-grey">{user.role}</span>
                </div>
                {user.college && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 6 }}>🏫 {user.college}</div>}
                {user.bio && <p style={{ fontSize: '0.9rem', marginBottom: 10 }}>{user.bio}</p>}
                {user.ratingAvg > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Stars rating={user.ratingAvg} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.ratingAvg.toFixed(1)} ({user.ratingCount} reviews)</span>
                  </div>
                )}
                {user.createdAt && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Member since {formatDate(user.createdAt)}</div>}
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>⚡ Switch Role</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Change how you use SkillSwap instantly</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ value: 'learner', label: '🎓 Learner' }, { value: 'teacher', label: '🏫 Teacher' }, { value: 'both', label: '⚡ Both' }].map(opt => (
            <button key={opt.value} className={`btn btn-sm ${user.role === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { if (user.role !== opt.value) { setUser({ ...user, role: opt.value as any }); setMsg(`Switched to ${opt.label} mode!`); setTimeout(() => setMsg(''), 2500); } }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills I Can Teach */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div><div className="section-title">Skills I Can Teach</div><div className="section-subtitle">Pass an exam to add a teaching skill</div></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingOffered(!addingOffered)}>{addingOffered ? 'Cancel' : '+ Add Skill'}</button>
        </div>
        {addingOffered && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <select className="form-select" value={selectedOffered} onChange={e => setSelectedOffered(e.target.value)} style={{ flex: 1 }}>
              <option value="">Select a skill…</option>
              {availableForOffered.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAddOffered}>Add</button>
          </div>
        )}
        {user.skillsOffered.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user.skillsOffered.map((s: any) => (
              <div key={s._id || s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="skill-tag verified">✓ {s.name || s}</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px' }} onClick={() => handleRemoveOffered(s._id || s)}>×</button>
              </div>
            ))}
          </div>
        ) : <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No teaching skills yet. Add skills you can teach.</div>}
      </div>

      {/* Skills I Want to Learn */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div><div className="section-title">Skills I Want to Learn</div><div className="section-subtitle">Your learning wishlist</div></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingWanted(!addingWanted)}>{addingWanted ? 'Cancel' : '+ Add Skill'}</button>
        </div>
        {addingWanted && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <select className="form-select" value={selectedWanted} onChange={e => setSelectedWanted(e.target.value)} style={{ flex: 1 }}>
              <option value="">Select a skill…</option>
              {availableForWanted.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAddWanted}>Add</button>
          </div>
        )}
        {user.skillsWanted.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user.skillsWanted.map((s: any) => (
              <div key={s._id || s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="skill-tag">📌 {s.name || s}</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px' }} onClick={() => handleRemoveWanted(s._id || s)}>×</button>
              </div>
            ))}
          </div>
        ) : <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No learning goals yet.</div>}
      </div>

      {reviews.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Reviews ({reviews.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div className="avatar avatar-sm"><span>{getInitials(r.reviewer?.name || '?')}</span></div>
                  <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer?.name}</div><Stars rating={r.rating} /></div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p style={{ fontSize: '0.875rem', marginLeft: 42 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
