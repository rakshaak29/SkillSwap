import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, timeAgo } from '../utils/helpers';
import { getNotifications, markNotificationRead, type Notification } from '../store/appStore';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      const refresh = () => setNotifications(getNotifications(user._id));
      refresh();
      const interval = setInterval(refresh, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleLogout = () => { logout(); navigate('/login'); setShowMenu(false); };

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-dot" /> SkillSwap
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link to="/login"><button className="btn btn-secondary btn-sm">Login</button></Link>
            <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-dot" /> SkillSwap
        </Link>

        <div className="navbar-nav">
          {[
            { to: '/', icon: '🏠', label: 'Dashboard' },
            { to: '/match', icon: '🔍', label: 'Find Teachers' },
            { to: '/skills', icon: '📚', label: 'Skills & Exams' },
            { to: '/sessions', icon: '💬', label: 'Sessions' },
            { to: '/requests', icon: '📨', label: 'Requests' },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`navbar-link ${isActive(item.to) ? 'active' : ''}`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button className="notif-btn" onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false); }}>
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div style={{ position: 'absolute', right: 0, top: '44px', width: '340px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && <span className="badge badge-grey">{unreadCount} new</span>}
                </div>
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => handleMarkRead(n._id)}
                        style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: n.isRead ? 'transparent' : 'var(--accent-dim)', cursor: 'pointer', transition: 'var(--transition)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{n.body}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Menu */}
          <div style={{ position: 'relative' }}>
            <div className="navbar-avatar" onClick={() => { setShowMenu(!showMenu); setShowNotifs(false); }}>
              {user.avatarUrl && !user.avatarUrl.startsWith('data:') && user.avatarUrl.startsWith('http')
                ? <img src={user.avatarUrl} alt={user.name} />
                : user.avatarUrl && user.avatarUrl.startsWith('data:')
                  ? <img src={user.avatarUrl} alt={user.name} />
                  : <span>{getInitials(user.name)}</span>
              }
            </div>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: '44px', width: '200px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
                {[{ label: '👤 Profile', to: '/profile' }, { label: '📚 Skills & Exams', to: '/skills' }].map(item => (
                  <Link key={item.label} to={item.to} onClick={() => setShowMenu(false)}
                    style={{ display: 'block', padding: '11px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={handleLogout}
                    style={{ width: '100%', padding: '11px 16px', fontSize: '0.875rem', color: 'var(--danger)', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showNotifs || showMenu) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => { setShowNotifs(false); setShowMenu(false); }} />
      )}
    </nav>
  );
};

export default Navbar;
