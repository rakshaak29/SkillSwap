import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHERS, SKILLS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { createRequest } from '../store/appStore';
import { getInitials, truncate } from '../utils/helpers';

const Stars = ({ rating }: { rating: number }) => (
  <div className="stars" style={{ display: 'inline-flex' }}>
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
  </div>
);

const RequestModal = ({ teacher, onClose, onSent }: { teacher: any; onClose: () => void; onSent: () => void }) => {
  const { user } = useAuth();
  const [learnSkillId, setLearnSkillId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!learnSkillId) return setError('Please select a skill to learn');
    setSending(true); setError('');
    await new Promise(r => setTimeout(r, 500));
    const skill = teacher.skillsOffered.find((s: any) => s._id === learnSkillId);
    createRequest({ fromUser: user, toUser: teacher, learnSkill: skill, message });
    setSending(false);
    onSent();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Send Swap Request</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <div className="avatar avatar-md">
            {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(teacher.name)}</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{teacher.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{teacher.college || 'Independent'}</div>
          </div>
        </div>
        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">I want to learn</label>
          <select className="form-select" value={learnSkillId} onChange={e => setLearnSkillId(e.target.value)}>
            <option value="">Select a skill…</option>
            {teacher.skillsOffered.map((s: any) => <option key={s._id} value={s._id}>{s.icon || '💡'} {s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Message (Optional)</label>
          <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Introduce yourself…" value={message} onChange={e => setMessage(e.target.value)} maxLength={300} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>{message.length}/300</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : '📨 Send Request'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const MatchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterSkill, setFilterSkill] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredTeachers = filterSkill
    ? TEACHERS.filter(t => t._id !== user?._id && t.skillsOffered.some((s: any) => s._id === filterSkill))
    : TEACHERS.filter(t => t._id !== user?._id);

  const handleRequestSent = () => {
    setSelectedTeacher(null);
    setSuccessMsg('Request sent! Check your Requests page.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="page">
      {selectedTeacher && <RequestModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} onSent={handleRequestSent} />}

      <div style={{ marginBottom: 28 }}>
        <h1>Find Teachers</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>All teachers are verified — they passed skill exams before teaching.</p>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ {successMsg}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ maxWidth: 280 }} value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
          <option value="">All Skills</option>
          {SKILLS.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
        </select>
        {filterSkill && <button className="btn btn-ghost btn-sm" onClick={() => setFilterSkill('')}>Clear filter ×</button>}
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found</span>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No teachers found</div>
          <div className="empty-desc">Try a different skill filter</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredTeachers.map(teacher => (
            <div key={teacher._id} className="teacher-card" style={{ padding: '28px', background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div className="avatar" style={{ width: 64, height: 64, border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(teacher.name)}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 2 }}>{teacher.name}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '0.82rem', marginBottom: 6 }}>{teacher.college || 'Independent'}</div>
                  {teacher.ratingAvg > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stars rating={teacher.ratingAvg} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{teacher.ratingAvg.toFixed(1)}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({teacher.ratingCount})</span>
                    </div>
                  )}
                </div>
              </div>

              {teacher.bio && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{truncate(teacher.bio, 100)}</p>}

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Expertise</div>
                  <span className="badge badge-verified" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>✓ Verified</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {teacher.skillsOffered.map((s: any) => (
                    <span key={s._id} className="skill-pill">{s.icon || '💡'} {s.name}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedTeacher(teacher)}>📨 Connect</button>
                <button className="btn btn-secondary" onClick={() => navigate(`/user/${teacher._id}`)}>Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchPage;
