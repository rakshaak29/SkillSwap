import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessionById, updateSession, getMessages, addMessage, addReview, hasReviewed, type Message, type Session } from '../store/appStore';
import { moderateMessage } from '../data/mockData';
import { getInitials, formatTime, generateId } from '../utils/helpers';

// STUN_SERVERS available for WebRTC integration: { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

const Stars = ({ rating, onSelect }: { rating: number; onSelect?: (r: number) => void }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onSelect?.(s)} style={{ fontSize: '1.75rem', cursor: onSelect ? 'pointer' : 'default', color: s <= rating ? 'var(--warning)' : 'var(--text-muted)', transition: 'var(--transition)' }}>★</span>
    ))}
  </div>
);

const ReviewModal = ({ session, partner, user, onClose, onSubmitted }: { session: Session; partner: any; user: any; onClose: () => void; onSubmitted: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (hasReviewed(session._id, user._id)) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h3>Already Reviewed</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 20 }}>You've already left a review for this session.</p>
          <button className="btn btn-primary btn-full" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    addReview({ session: session._id, reviewer: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl }, reviewee: partner._id, rating, comment });
    setSubmitting(false);
    onSubmitted();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ textAlign: 'center', maxWidth: 420 }}>
        <div className="modal-header"><h3 className="modal-title">Rate This Session</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>How was your experience? Your feedback helps build trust.</p>
        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Stars rating={rating} onSelect={setRating} /></div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Comment (Optional)</label>
          <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Share your experience…" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting || !rating}>
            {submitting ? 'Submitting…' : 'Submit Review ★'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  );
};

// ── Video Call Component ──────────────────────────────────────────────────────
const VideoCall = ({ partner, onEnd }: { partner: any; onEnd: () => void }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'ended'>('connecting');

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        // Simulate remote connecting after 2s
        setTimeout(() => { if (active) setCallStatus('active'); }, 2000);
      })
      .catch(() => { if (active) setCallStatus('ended'); });
    return () => {
      active = false;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleMic = () => { localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setMicOn(m => !m); };
  const toggleCam = () => { localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setCamOn(c => !c); };
  const handleEndCall = () => { localStreamRef.current?.getTracks().forEach(t => t.stop()); onEnd(); };

  return (
    <div style={{ background: '#0a0a0f', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '42%', background: '#111' }}>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Remote video placeholder */}
        {callStatus !== 'active' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#fff' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 4 }}>
              {partner?.avatarUrl?.startsWith('http') ? <img src={partner.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(partner?.name || '?')}</span>}
            </div>
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff', width: 24, height: 24 }} />
            <span style={{ fontSize: '0.875rem' }}>Connecting to {partner?.name}…</span>
          </div>
        )}
        {callStatus === 'active' && (
          <>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
              <div style={{ textAlign: 'center', color: '#fff' }}>
                {partner?.avatarUrl?.startsWith('http') && <img src={partner.avatarUrl} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 12, border: '3px solid rgba(255,255,255,0.2)' }} />}
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{partner?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Video call active</div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 12, left: 16 }}>
              <span style={{ background: 'rgba(34,197,94,0.9)', borderRadius: 99, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>● LIVE</span>
            </div>
          </>
        )}
        {/* Local video PiP */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 120, height: 80, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: '#222' }}>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          {!camOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: '#fff' }}>📷</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 20px', background: 'rgba(0,0,0,0.7)' }}>
        <button onClick={toggleMic} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '1.1rem', background: micOn ? 'rgba(255,255,255,0.15)' : 'var(--danger)', color: '#fff', transition: 'var(--transition)' }}>{micOn ? '🎙️' : '🔇'}</button>
        <button onClick={toggleCam} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '1.1rem', background: camOn ? 'rgba(255,255,255,0.15)' : 'var(--danger)', color: '#fff', transition: 'var(--transition)' }}>{camOn ? '📹' : '🚫'}</button>
        <button onClick={handleEndCall} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '1.25rem', background: 'var(--danger)', color: '#fff', boxShadow: '0 4px 12px rgba(239,68,68,0.5)' }}>📵</button>
      </div>
    </div>
  );
};

// ── Main Session Page ─────────────────────────────────────────────────────────
const SessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [modWarning, setModWarning] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [terminated, setTerminated] = useState<{ message: string } | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!id) return;
    const s = getSessionById(id);
    if (!s) { navigate('/sessions'); return; }
    setSession(s);
    setWarningsCount(s.warningsCount || 0);
    setMessages(getMessages(id));
    setLoading(false);

    // Poll for new messages every 1.5s (simulating real-time)
    const interval = setInterval(() => {
      if (id) setMessages(getMessages(id));
    }, 1500);
    return () => clearInterval(interval);
  }, [id, navigate]);

  // Simulate partner typing occasionally
  useEffect(() => {
    if (!session || session.status === 'completed' || session.status === 'cancelled') return;
    const scheduleTyping = () => {
      const delay = 8000 + Math.random() * 15000;
      partnerTypingTimeoutRef.current = setTimeout(() => {
        setPartnerTyping(true);
        setTimeout(() => setPartnerTyping(false), 2000 + Math.random() * 2000);
        scheduleTyping();
      }, delay);
    };
    scheduleTyping();
    return () => { if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current); };
  }, [session]);

  const handleSend = useCallback(() => {
    if (!text.trim() || sendingMsg || !user || !id) return;
    setSendingMsg(true);

    const modResult = moderateMessage(text.trim());
    const flagged = modResult.label !== 'safe';
    const newWarnings = flagged ? warningsCount + 1 : warningsCount;

    const msg: Message = {
      _id: generateId(), sessionId: id,
      sender: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl || '' },
      text: text.trim(), flagged, modLabel: modResult.label, reason: modResult.reason,
      sentAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };

    const updated = addMessage(id, msg);
    setMessages(updated);

    if (flagged) {
      setWarningsCount(newWarnings);
      if (newWarnings >= 2) {
        // AUTO-TERMINATE
        updateSession(id, { status: 'cancelled', moderationStatus: 'flagged', warningsCount: newWarnings });
        setSession(prev => prev ? { ...prev, status: 'cancelled', moderationStatus: 'flagged' } : null);
        setTerminated({ message: '🚫 This session has been terminated by AI moderation due to repeated off-topic discussions. Both participants have been notified.' });
        setShowVideoCall(false);
      } else {
        updateSession(id, { moderationStatus: 'warned', warningsCount: newWarnings });
        setSession(prev => prev ? { ...prev, moderationStatus: 'warned', warningsCount: newWarnings } : null);
        const warnMsg = modResult.label === 'off-topic'
          ? `⚠️ AI Moderation Warning: Your message seems off-topic. Keep conversations skill-related. Warning ${newWarnings}/2 — next violation terminates the session.`
          : `⚠️ AI Moderation Warning: Message flagged as ${modResult.label}. Keep it appropriate. Warning ${newWarnings}/2.`;
        setModWarning(warnMsg);
        setTimeout(() => setModWarning(''), 8000);
      }
    }

    setText('');
    setSendingMsg(false);
  }, [text, id, user, sendingMsg, warningsCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 1500);
  };

  const handleEndSession = async () => {
    if (!window.confirm('End this session?') || !id) return;
    updateSession(id, { status: 'completed' });
    setSession(prev => prev ? { ...prev, status: 'completed' } : null);
    setShowReview(true);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span className="loading-text">Loading session…</span></div>;
  if (!session || !user) return null;

  const partner = session.userA?._id === user._id ? session.userB : session.userA;
  const isTeacher = session.userB?._id === user._id;
  const isCompleted = session.status === 'completed' || session.status === 'cancelled';

  return (
    <div style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', padding: '16px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {showReview && partner && (
        <ReviewModal session={session} partner={partner} user={user}
          onClose={() => { setShowReview(false); navigate('/sessions'); }}
          onSubmitted={() => { setShowReview(false); navigate('/sessions'); }}
        />
      )}

      {/* Session Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '12px 20px' }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate('/sessions')}>←</button>
        <div className="avatar avatar-md">
          {partner?.avatarUrl?.startsWith('http') ? <img src={partner.avatarUrl} alt={partner?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(partner?.name || '?')}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{partner?.name || 'Unknown'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {isTeacher ? '🏫 You are teaching' : '🎓 You are learning'}: {session.learnSkill?.name || 'Skill Session'}
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', marginLeft: 4, animation: 'pulse 2s infinite' }} />
            <span>Connected</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className={`badge badge-${session.status === 'active' ? 'success' : session.status === 'completed' ? 'grey' : 'info'}`}>{session.status}</span>
          {warningsCount > 0 && <span className="badge badge-warning">⚠️ {warningsCount} warning{warningsCount > 1 ? 's' : ''}</span>}
          {!isCompleted && !showVideoCall && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowVideoCall(true)}>📹 Video Call</button>
          )}
          {!isCompleted && <button className="btn btn-danger btn-sm" onClick={handleEndSession}>End Session</button>}
          {isCompleted && !showReview && <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>⭐ Rate Session</button>}
        </div>
      </div>

      {/* Termination Banner */}
      {terminated && (
        <div style={{ marginBottom: 12, padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.75rem' }}>🚫</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Session Terminated by AI Moderation</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{terminated.message}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sessions')}>← Back</button>
        </div>
      )}

      {/* Video Call */}
      {showVideoCall && !isCompleted && (
        <VideoCall partner={partner} onEnd={() => setShowVideoCall(false)} />
      )}

      {/* Chat */}
      <div className="chat-container" style={{ flex: 1, minHeight: 0 }}>
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>👋</div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Session started!</div>
              <div style={{ fontSize: '0.825rem' }}>Say hello and start your learning session with {partner?.name}.</div>
              <div style={{ marginTop: 16, padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-block' }}>
                💡 AI Moderation is active. Keep conversations on-topic. 2 warnings = session terminated.
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isOwn = msg.sender?._id === user._id;
            const senderName = isOwn ? 'You' : (msg.sender?.name || partner?.name || 'Them');
            const showAvatar = !isOwn && (i === 0 || messages[i-1]?.sender?._id !== msg.sender?._id);

            return (
              <div key={msg._id} className={`chat-message ${isOwn ? 'own' : 'other'} ${msg.flagged ? 'flagged' : ''}`}>
                {!isOwn && (
                  <div className="avatar avatar-sm" style={{ alignSelf: 'flex-end', opacity: showAvatar ? 1 : 0 }}>
                    {partner?.avatarUrl?.startsWith('http') ? <img src={partner.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getInitials(senderName)}</span>}
                  </div>
                )}
                <div>
                  <div className="message-bubble">
                    {msg.flagged && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--warning)', marginBottom: 4 }}>
                        ⚠️ {msg.modLabel === 'off-topic' ? 'Off-topic message' : 'Flagged message'}
                      </div>
                    )}
                    {msg.text}
                  </div>
                  <div className="message-meta">{formatTime(msg.sentAt)}</div>
                </div>
              </div>
            );
          })}

          {partnerTyping && !isCompleted && (
            <div className="chat-message other">
              <div className="avatar avatar-sm"><span>{getInitials(partner?.name || '?')}</span></div>
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
                <span>{partner?.name} is typing…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {modWarning && (
          <div className="moderation-warning"><span>⚠️</span><span>{modWarning}</span></div>
        )}

        {!isCompleted && !terminated ? (
          <div className="chat-input-area">
            <textarea ref={undefined} className="chat-input" placeholder={`Message ${partner?.name || 'your partner'}… (AI moderation active)`} value={text} onChange={handleTextChange} onKeyDown={handleKeyDown} rows={1} />
            <button className="chat-send-btn" onClick={handleSend} disabled={!text.trim() || sendingMsg}>➤</button>
          </div>
        ) : terminated ? (
          <div style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--danger)', fontSize: '0.875rem', borderTop: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            🚫 Session terminated by AI moderation.
          </div>
        ) : (
          <div style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            Session ended. <button className="btn btn-ghost btn-sm" onClick={() => setShowReview(true)}>Leave a review ★</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionPage;
