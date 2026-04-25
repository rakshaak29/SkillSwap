import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySessions, type Session } from '../store/appStore';
import { getInitials, timeAgo } from '../utils/helpers';

const SessionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (!user) return;
    setSessions(getMySessions(user._id));
    setLoading(false);
  }, [user]);

  const tabs = [
    { key: 'active', label: '🟢 Active', filter: (s: Session) => s.status === 'active' || s.status === 'scheduled' },
    { key: 'completed', label: '✅ Completed', filter: (s: Session) => s.status === 'completed' },
    { key: 'cancelled', label: '❌ Cancelled', filter: (s: Session) => s.status === 'cancelled' },
    { key: 'all', label: '📋 All', filter: () => true },
  ];

  const currentFilter = tabs.find(t => t.key === activeTab)?.filter || (() => true);
  const filtered = sessions.filter(currentFilter as any);

  const statusBadge: Record<string, string> = { scheduled: 'info', active: 'success', completed: 'grey', cancelled: 'danger' };
  const statusIcon: Record<string, string> = { scheduled: '🗓️', active: '🟢', completed: '✅', cancelled: '❌' };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span className="loading-text">Loading sessions…</span></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1>My Sessions</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>All your skill learning and teaching sessions</p>
      </div>
      <div className="tabs" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            <span className="badge badge-grey" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>{sessions.filter(tab.filter as any).length}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-title">No {activeTab} sessions</div>
          <div className="empty-desc">{activeTab === 'active' ? 'Send a swap request or start a demo session' : 'Sessions will appear here once created'}</div>
          {activeTab === 'active' && <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/match')}>Find Teachers</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(session => {
            const partner = session.userA?._id === user?._id ? session.userB : session.userA;
            const isTeacher = session.userB?._id === user?._id;
            return (
              <div key={session._id} className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }} onClick={() => navigate(`/session/${session._id}`)}>
                <div className="avatar avatar-md">
                  {partner?.avatarUrl && partner.avatarUrl.startsWith('http')
                    ? <img src={partner.avatarUrl} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span>{getInitials(partner?.name || '?')}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{partner?.name || 'Unknown'}</span>
                    <span className={`badge badge-${statusBadge[session.status] || 'grey'}`}>{statusIcon[session.status]} {session.status}</span>
                    {session.moderationStatus !== 'clean' && (
                      <span className={`badge badge-${session.moderationStatus === 'flagged' ? 'danger' : 'warning'}`}>
                        {session.moderationStatus === 'flagged' ? '🚩 Flagged' : '⚠️ Warned'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                    <span>{isTeacher ? '🏫 Teaching' : '🎓 Learning'}: {session.learnSkill?.name || 'Skill Session'}</span>
                    <span>{timeAgo(session.updatedAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {(session.status === 'active' || session.status === 'scheduled') && (
                    <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); navigate(`/session/${session._id}`); }}>💬 Open Chat</button>
                  )}
                  {session.status === 'completed' && (
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/session/${session._id}`); }}>View</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
