import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySessions, getMyRequests, getExamResults, createDemoSession, type Session, type ExamResult } from '../store/appStore';
import { getInitials, timeAgo } from '../utils/helpers';

const Stars = ({ rating }: { rating: number }) => (
  <div className="stars" style={{ display: 'inline-flex' }}>
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
  </div>
);

const StatCard = ({ icon, value, label, color }: { icon: string; value: any; label: string; color: string }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const SessionCard = ({ session, user, navigate }: { session: Session; user: any; navigate: any }) => {
  const partner = session.userA?._id === user._id ? session.userB : session.userA;
  const isTeacher = session.userB?._id === user._id;
  const statusColor: Record<string, string> = { scheduled: 'info', active: 'success', completed: 'grey', cancelled: 'danger' };
  const statusIcon: Record<string, string> = { scheduled: '🗓️', active: '🟢', completed: '✅', cancelled: '❌' };
  return (
    <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }} onClick={() => navigate(`/session/${session._id}`)}>
      <div className="avatar avatar-md">
        {partner?.avatarUrl && (partner.avatarUrl.startsWith('http') || partner.avatarUrl.startsWith('data:'))
          ? <img src={partner.avatarUrl} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : <span>{getInitials(partner?.name || '?')}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{partner?.name || 'Unknown'}</span>
          <span className={`badge badge-${statusColor[session.status] || 'grey'}`}>{statusIcon[session.status]} {session.status}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isTeacher ? '🏫 Teaching' : '🎓 Learning'}: {session.learnSkill?.name || 'Skill Session'}
          {session.updatedAt && <span style={{ marginLeft: 12 }}>{timeAgo(session.updatedAt)}</span>}
        </div>
      </div>
      {(session.status === 'active' || session.status === 'scheduled') && (
        <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); navigate(`/session/${session._id}`); }}>Join →</button>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) return;
    setSessions(getMySessions(user._id));
    setRequests(getMyRequests(user._id));
    setExamResults(getExamResults(user._id));
    setLoading(false);
  }, [user]);

  const handleDemoSession = async () => {
    if (!user) return;
    const session = createDemoSession(user);
    navigate(`/session/${session._id}`);
  };

  if (!user) return null;
  if (loading) return <div className="loading-screen"><div className="spinner" /><span className="loading-text">Loading dashboard…</span></div>;

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'scheduled').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const pendingReceived = requests.received.filter(r => r.status === 'pending');
  const pendingSent = requests.sent.filter(r => r.status === 'pending');
  const passedExams = examResults.filter(r => r.status === 'passed').length;

  const gradients: Record<string, string> = {
    learner: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    teacher: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    both: 'linear-gradient(135deg, #6366f1, #a78bfa)',
  };

  const welcomeEmojis: Record<string, string> = { learner: '🎓', teacher: '🏫', both: '👋' };

  return (
    <div className="page">
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="avatar avatar-lg" style={{ background: gradients[user.role] || gradients.learner, flexShrink: 0 }}>
          {user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:'))
            ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : <span>{getInitials(user.name)}</span>}
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Welcome back, {user.name.split(' ')[0]} {welcomeEmojis[user.role]}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span style={{ background: gradients[user.role], WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, textTransform: 'capitalize' }}>{user.role}</span>
            {user.college && ` · ${user.college}`}
            {user.ratingAvg > 0 && <span style={{ marginLeft: 12 }}><Stars rating={user.ratingAvg} /> {user.ratingAvg.toFixed(1)}</span>}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={handleDemoSession}>⚡ Start Demo Session</button>
          <Link to="/match"><button className="btn btn-primary">🔍 Find Teachers</button></Link>
          {(user.role === 'teacher' || user.role === 'both') && (
            <Link to="/requests"><button className="btn btn-secondary">📨 Requests {pendingReceived.length > 0 && `(${pendingReceived.length})`}</button></Link>
          )}
        </div>
      </div>

      {/* Pending alert */}
      {pendingReceived.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          📨 You have <strong>{pendingReceived.length}</strong> pending swap request{pendingReceived.length > 1 ? 's' : ''} from learners!
          <Link to="/requests" style={{ marginLeft: 'auto', color: 'var(--info)', fontWeight: 600, textDecoration: 'underline' }}>Respond →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="💬" value={activeSessions} label="Active Sessions" color="#6366f1" />
        <StatCard icon="✅" value={completedSessions} label="Completed" color="var(--success)" />
        <StatCard icon="📨" value={user.role !== 'learner' ? pendingReceived.length : pendingSent.length} label={user.role !== 'learner' ? 'New Requests' : 'Sent Requests'} color="var(--danger)" />
        <StatCard icon="🏆" value={passedExams} label="Exams Passed" color="var(--warning)" />
      </div>

      {/* Tab switcher for 'both' */}
      {user.role === 'both' && (
        <div className="tabs" style={{ marginBottom: 28 }}>
          {[{ key: 'overview', label: '📊 Overview' }, { key: 'learner', label: '🎓 As Learner' }, { key: 'teacher', label: '🏫 As Teacher' }].map(tab => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* Skills grid */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        {(user.role === 'teacher' || user.role === 'both') && (
          <div className="card">
            <div className="section-header">
              <div><div className="section-title">Skills I Can Teach</div><div className="section-subtitle">Verified by exam</div></div>
              <Link to="/skills"><button className="btn btn-ghost btn-sm">Manage →</button></Link>
            </div>
            {user.skillsOffered?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.skillsOffered.map((s: any) => <span key={s._id || s} className="skill-tag verified">✓ {s.name || s}</span>)}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">🎓</div>
                <div className="empty-title">No verified skills yet</div>
                <Link to="/skills" style={{ marginTop: 8 }}><button className="btn btn-secondary btn-sm">Take Exam</button></Link>
              </div>
            )}
          </div>
        )}

        {(user.role === 'learner' || user.role === 'both') && (
          <div className="card">
            <div className="section-header">
              <div><div className="section-title">Skills I Want to Learn</div><div className="section-subtitle">My learning wishlist</div></div>
              <Link to="/match"><button className="btn btn-ghost btn-sm">Find Teacher →</button></Link>
            </div>
            {user.skillsWanted?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.skillsWanted.map((s: any) => <span key={s._id || s} className="skill-tag">📌 {s.name || s}</span>)}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">📚</div>
                <div className="empty-title">No skills added yet</div>
                <Link to="/profile" style={{ marginTop: 8 }}><button className="btn btn-secondary btn-sm">Edit Profile</button></Link>
              </div>
            )}
          </div>
        )}

        {/* Exam Results */}
        <div className="card">
          <div className="section-header">
            <div><div className="section-title">Exam Results</div><div className="section-subtitle">Your skill verifications</div></div>
            <Link to="/skills"><button className="btn btn-ghost btn-sm">Take Exam →</button></Link>
          </div>
          {examResults.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon">📝</div>
              <div className="empty-title">No exams taken yet</div>
              <Link to="/skills" style={{ marginTop: 8 }}><button className="btn btn-primary btn-sm">Take Exam</button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {examResults.slice(0, 4).map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{r.skill?.name}</span>
                  <div style={{ flex: 2, height: 6, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ width: `${r.scorePercent}%`, height: '100%', background: r.status === 'passed' ? 'var(--success)' : 'var(--danger)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: r.status === 'passed' ? 'var(--success)' : 'var(--danger)', minWidth: 36 }}>{r.scorePercent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending requests (teacher) */}
      {(user.role === 'teacher' || user.role === 'both') && pendingReceived.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <div><div className="section-title">Pending Requests</div><div className="section-subtitle">Learners waiting for you</div></div>
            <Link to="/requests"><button className="btn btn-ghost btn-sm">View All →</button></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingReceived.slice(0, 3).map((r: any) => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="avatar avatar-sm"><span>{getInitials(r.fromUser?.name || '?')}</span></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.fromUser?.name || 'Learner'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.learnSkill?.name || 'Skill Session'}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/requests')}>Review</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div><div className="section-title">Recent Sessions</div></div>
          <Link to="/sessions"><button className="btn btn-ghost btn-sm">View All →</button></Link>
        </div>
        {sessions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">No sessions yet</div>
              <div className="empty-desc">Start a demo session or find a teacher to begin</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost" onClick={handleDemoSession}>⚡ Demo Session</button>
                <Link to="/match"><button className="btn btn-primary">Find Teachers</button></Link>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.slice(0, 5).map(s => <SessionCard key={s._id} session={s} user={user} navigate={navigate} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
