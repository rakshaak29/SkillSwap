import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TEACHERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { getReviews, type Review } from '../store/appStore';
import { getInitials, formatDate } from '../utils/helpers';

const Stars = ({ rating }: { rating: number }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
  </div>
);

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = TEACHERS.find(t => t._id === userId) || null;
    setProfile(found);
    if (userId) setReviews(getReviews(userId));
    setLoading(false);
  }, [userId]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">👤</div>
        <div className="empty-title">User not found</div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/match')}>← Back to Find Teachers</button>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar avatar-xl" style={{ border: '2px solid var(--border-default)', flexShrink: 0 }}>
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(profile.name)}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2>{profile.name}</h2>
              <span className="badge badge-verified">✓ {profile.role}</span>
            </div>
            {profile.college && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>🏫 {profile.college}</div>}
            {profile.bio && <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>{profile.bio}</p>}
            {profile.ratingAvg > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Stars rating={profile.ratingAvg} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{profile.ratingAvg.toFixed(1)} ({profile.ratingCount} reviews)</span>
              </div>
            )}
            {me && me._id !== profile._id && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/match')}>📨 Send Swap Request</button>
            )}
          </div>
        </div>
      </div>

      {profile.skillsOffered?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Skills They Teach</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.skillsOffered.map((s: any) => (
              <span key={s._id} className="skill-tag verified">✓ {s.icon} {s.name}</span>
            ))}
          </div>
        </div>
      )}

      {profile.verifiedSkills?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Verified Scores</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.verifiedSkills.map((vs: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>{vs.skill?.name}</span>
                <div style={{ flex: 2, height: 6, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div style={{ width: `${vs.scorePercent}%`, height: '100%', background: 'var(--success)', borderRadius: 99 }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--success)', minWidth: 36 }}>{vs.scorePercent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Reviews ({reviews.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div className="avatar avatar-sm"><span>{getInitials(r.reviewer?.name || '?')}</span></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer?.name}</div>
                    <Stars rating={r.rating} />
                  </div>
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

export default UserProfilePage;
