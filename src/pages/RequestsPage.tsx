import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRequests, updateRequestStatus, type SwapRequest } from '../store/appStore';
import { getInitials, timeAgo } from '../utils/helpers';

const RequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sent, setSent] = useState<SwapRequest[]>([]);
  const [received, setReceived] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = () => {
    if (!user) return;
    const { sent: s, received: r } = getMyRequests(user._id);
    setSent(s); setReceived(r); setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;
    setUpdating(requestId);
    await new Promise(r => setTimeout(r, 500));
    const { session } = updateRequestStatus(requestId, status, user);
    fetchRequests();
    if (status === 'accepted' && session) {
      setTimeout(() => navigate(`/session/${session._id}`), 500);
    }
    setUpdating(null);
  };

  const statusBadge: Record<string, string> = { pending: 'pending', accepted: 'success', rejected: 'danger' };
  const statusIcon: Record<string, string> = { pending: '⏳', accepted: '✅', rejected: '❌' };

  const RequestCard = ({ req, type }: { req: SwapRequest; type: string }) => {
    const other = type === 'received' ? req.fromUser : req.toUser;
    return (
      <div className="request-card">
        <div className="avatar avatar-md">
          {other?.avatarUrl && other.avatarUrl.startsWith('http')
            ? <img src={other.avatarUrl} alt={other.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : <span>{getInitials(other?.name || '?')}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{other?.name || 'Unknown'}</span>
            <span className={`badge badge-${statusBadge[req.status] || 'grey'}`}>{statusIcon[req.status]} {req.status}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            {type === 'received'
              ? <span>Wants to learn <strong>{req.learnSkill?.name || 'a skill'}</strong> from you</span>
              : <span>You want to learn <strong>{req.learnSkill?.name || 'a skill'}</strong></span>}
          </div>
          {req.message && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginTop: 6, fontStyle: 'italic' }}>
              "{req.message}"
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(req.createdAt)}</div>
        </div>
        {type === 'received' && req.status === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button className="btn btn-success btn-sm" disabled={updating === req._id} onClick={() => handleUpdateStatus(req._id, 'accepted')}>
              {updating === req._id ? '…' : '✓ Accept'}
            </button>
            <button className="btn btn-danger btn-sm" disabled={updating === req._id} onClick={() => handleUpdateStatus(req._id, 'rejected')}>
              ✗ Reject
            </button>
          </div>
        )}
        {req.status === 'accepted' && (
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sessions')}>View Session →</button>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span className="loading-text">Loading requests…</span></div>;
  const pendingReceived = received.filter(r => r.status === 'pending').length;

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1>Swap Requests</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Manage incoming and outgoing skill exchange requests</p>
      </div>
      {pendingReceived > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          📨 You have <strong>{pendingReceived}</strong> request{pendingReceived > 1 ? 's' : ''} waiting!
        </div>
      )}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>
          📥 Received {pendingReceived > 0 && <span className="badge badge-warning" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>{pendingReceived}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
          📤 Sent <span className="badge badge-grey" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>{sent.length}</span>
        </button>
      </div>
      {activeTab === 'received' && (
        received.length === 0
          ? <div className="empty-state"><div className="empty-icon">📥</div><div className="empty-title">No requests received</div><div className="empty-desc">When others send you swap requests, they'll appear here</div></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{received.map(req => <RequestCard key={req._id} req={req} type="received" />)}</div>
      )}
      {activeTab === 'sent' && (
        sent.length === 0
          ? <div className="empty-state"><div className="empty-icon">📤</div><div className="empty-title">No requests sent</div><div className="empty-desc">Find a teacher and send them a swap request</div><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/match')}>Find Teachers →</button></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{sent.map(req => <RequestCard key={req._id} req={req} type="sent" />)}</div>
      )}
    </div>
  );
};

export default RequestsPage;
