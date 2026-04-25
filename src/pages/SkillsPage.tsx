import { useState, useEffect, useCallback, useRef } from 'react';
import { SKILLS, CATEGORIES, EXAMS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { getExamResults, saveExamResult, type ExamResult } from '../store/appStore';
import { generateId } from '../utils/helpers';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ── Camera Proctor ────────────────────────────────────────────────────────────
const CameraProctor = ({ onViolation }: { onViolation: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camStatus, setCamStatus] = useState<'requesting' | 'active' | 'denied'>('requesting');

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamStatus('active');
      }).catch(() => { if (active) setCamStatus('denied'); });
    return () => { active = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden && camStatus === 'active') onViolation(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [camStatus, onViolation]);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: 'var(--bg-card)', border: `2px solid ${camStatus === 'active' ? 'var(--success)' : camStatus === 'denied' ? 'var(--danger)' : 'var(--warning)'}`, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', width: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {camStatus === 'active' ? (
        <>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: 100, objectFit: 'cover' }} />
          <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> Proctored
          </div>
        </>
      ) : camStatus === 'denied' ? (
        <div style={{ padding: 12, textAlign: 'center', fontSize: '0.75rem', color: 'var(--danger)' }}><div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🚫</div>Camera denied</div>
      ) : (
        <div style={{ padding: 12, textAlign: 'center', fontSize: '0.75rem', color: 'var(--warning)' }}><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, margin: '0 auto 6px' }} />Starting…</div>
      )}
    </div>
  );
};

// ── Exam Modal ────────────────────────────────────────────────────────────────
const ExamModal = ({ exam, skillName, skillId, userId, onClose, onComplete }: { exam: any; skillName: string; skillId: string; userId: string; onClose: () => void; onComplete: (result: any) => void }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setLeft] = useState((exam.timeLimitMins || 20) * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [violations, setViolations] = useState(0);
  const [violationAlert, setViolationAlert] = useState('');
  const submitRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submitRef.current) return;
    submitRef.current = true;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    // Score the exam
    let totalMarks = 0; let earned = 0;
    exam.questions.forEach((q: any) => {
      totalMarks += q.marks;
      if (q.questionType === 'coding') {
        const code = codeAnswers[q._id] || '';
        if (code.length > 20) earned += q.marks * 0.6; // partial credit for attempting
      } else if (q.questionType === 'portfolio') {
        const url = answers[q._id] || '';
        if (url.startsWith('http') && url.length > 8) earned += q.marks;
      } else {
        if (answers[q._id]?.toUpperCase() === q.answerKey?.toUpperCase()) earned += q.marks;
      }
    });

    const scorePercent = totalMarks > 0 ? Math.round((earned / totalMarks) * 100) : 0;
    const status = scorePercent >= exam.minScorePercent ? 'passed' : 'failed';
    const skill = SKILLS.find(s => s._id === skillId);

    const examResult: ExamResult = {
      _id: generateId(), user: userId,
      exam: exam._id, skill,
      attemptNo: 1, scorePercent, status,
      createdAt: new Date().toISOString(),
    };
    saveExamResult(examResult);
    setResult({ scorePercent, status, minScorePercent: exam.minScorePercent, earned: Math.round(earned * 100) / 100, totalMarks, attemptsLeft: exam.maxAttempts - 1 });
    setSubmitted(true);
    onComplete(examResult);
    setSubmitting(false);
  }, [answers, codeAnswers, exam, skillId, userId, onComplete]);

  const handleViolation = useCallback(() => {
    setViolations(v => {
      const next = v + 1;
      setViolationAlert(`⚠️ Tab switch detected! Warning ${next}/3.`);
      setTimeout(() => setViolationAlert(''), 5000);
      if (next >= 3 && !submitRef.current) handleSubmit();
      return next;
    });
  }, [handleSubmit]);

  // Timer
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setLeft(prev => { if (prev <= 1) { clearInterval(timer); if (!submitRef.current) handleSubmit(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, handleSubmit]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timerClass = timeLeft < 120 ? 'danger' : timeLeft < 300 ? 'warning' : '';
  const total = exam.questions.length;
  const q = exam.questions[currentQ];

  if (submitted && result) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{result.status === 'passed' ? '🏆' : '😔'}</div>
          <h2 style={{ marginBottom: 8 }}>{result.status === 'passed' ? 'Exam Passed!' : 'Exam Failed'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            {result.status === 'passed' ? `You've been verified in ${skillName}!` : `You scored ${result.scorePercent}%. Need ${result.minScorePercent}% to pass.`}
          </p>
          {violations > 0 && <div className="alert alert-warning" style={{ marginBottom: 16, fontSize: '0.8rem' }}>⚠️ {violations} tab-switch violation{violations > 1 ? 's' : ''} recorded.</div>}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Score</span>
              <span style={{ fontWeight: 700, color: result.status === 'passed' ? 'var(--success)' : 'var(--danger)', fontSize: '1.25rem' }}>{result.scorePercent}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${result.scorePercent}%`, height: '100%', background: result.status === 'passed' ? 'var(--success)' : 'var(--danger)', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>{result.earned}/{result.totalMarks} marks</span>
              <span>Pass: {result.minScorePercent}%</span>
              {result.attemptsLeft > 0 && <span>{result.attemptsLeft} attempt{result.attemptsLeft !== 1 ? 's' : ''} left</span>}
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={onClose}>{result.status === 'passed' ? '→ View Profile' : 'Try Again Later'}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CameraProctor onViolation={handleViolation} />
      <div className="modal-overlay" style={{ background: 'var(--bg-primary)', alignItems: 'flex-start', paddingTop: 0 }}>
        <div className="modal" style={{ maxWidth: 720, width: '100%', height: '100vh', maxHeight: '100vh', borderRadius: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>📝 {skillName} Exam</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {exam.questions.filter((qq: any) => qq.questionType === 'coding' ? !!codeAnswers[qq._id] : !!answers[qq._id]).length}/{total} answered · 🎥 Live Proctored
                {violations > 0 && <span style={{ color: 'var(--warning)', marginLeft: 8 }}>⚠️ {violations} violation{violations > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className={`exam-timer ${timerClass}`}>{mins}:{secs}</div>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>
          </div>

          <div style={{ padding: '20px 24px', flex: 1 }}>
            {violationAlert && <div className="alert alert-warning" style={{ marginBottom: 12, fontSize: '0.8rem' }}>{violationAlert}</div>}

            {/* Progress */}
            <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-elevated)', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ width: `${((currentQ + 1) / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>

            {/* Question */}
            <div className="question-card">
              <div className="question-number">
                Question {currentQ + 1} of {total}
                {q.questionType === 'coding' && <span style={{ marginLeft: 8, color: 'var(--info)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'none' }}>• Coding ({q.language})</span>}
                {q.questionType === 'portfolio' && <span style={{ marginLeft: 8, color: 'var(--warning)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'none' }}>• Portfolio</span>}
              </div>
              <div className="question-text">{q.questionText}</div>

              {q.questionType === 'coding' ? (
                <div>
                  {q.testCases?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Test Cases</div>
                      {q.testCases.slice(0, 2).map((tc: any, i: number) => (
                        <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 6, fontSize: '0.8rem', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> {tc.input}</div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Expected:</span> {tc.expectedOutput}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={codeAnswers[q._id] || q.starterCode || ''}
                    onChange={e => setCodeAnswers({ ...codeAnswers, [q._id]: e.target.value })}
                    style={{ width: '100%', minHeight: 200, fontFamily: '"Fira Code", "Cascadia Code", monospace', fontSize: '0.85rem', lineHeight: 1.6, padding: '14px 16px', background: '#0d1117', color: '#e6edf3', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', resize: 'vertical', outline: 'none' }}
                    spellCheck={false}
                  />
                </div>
              ) : q.questionType === 'portfolio' ? (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Submit a link to your previous work (Behance, GitHub, Drive, SoundCloud, etc.)</div>
                  <div className="form-group">
                    <label className="form-label">Portfolio URL</label>
                    <input type="url" className="form-input" placeholder="https://..." value={answers[q._id] || ''} onChange={e => setAnswers({ ...answers, [q._id]: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="options-grid">
                  {OPTION_LABELS.map(key => {
                    const val = q[`option${key}`];
                    if (!val) return null;
                    return (
                      <button key={key} className={`option-btn ${answers[q._id] === key ? 'selected' : ''}`} onClick={() => setAnswers({ ...answers, [q._id]: key })}>
                        <span className="option-key">{key}</span>{val}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1, marginRight: 16 }}>
                {exam.questions.map((qu: any, i: number) => {
                  const answered = qu.questionType === 'coding' ? !!codeAnswers[qu._id] : !!answers[qu._id];
                  return (
                    <button key={qu._id} onClick={() => setCurrentQ(i)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: answered ? 'var(--bg-active)' : 'var(--bg-input)', borderColor: i === currentQ ? 'var(--border-focus)' : answered ? 'var(--border-strong)' : 'var(--border-default)', color: answered ? 'var(--text-primary)' : 'var(--text-muted)' }}>{i + 1}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>← Prev</button>
                {currentQ < total - 1
                  ? <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
                  : <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : 'Submit Exam ✓'}
                    </button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Skills Page ───────────────────────────────────────────────────────────────
const SkillsPage = () => {
  const { user, setUser } = useAuth();
  const [myResults, setMyResults] = useState<ExamResult[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeExam, setActiveExam] = useState<any>(null);
  const [activeExamSkill, setActiveExamSkill] = useState<any>(null);
  const [loadingExam, setLoadingExam] = useState<string | null>(null);

  useEffect(() => {
    if (user) setMyResults(getExamResults(user._id));
  }, [user]);

  const getMyResult = (skillId: string) => myResults.filter(r => r.skill?._id === skillId).sort((a, b) => b.attemptNo - a.attemptNo)[0];
  const hasPassed = (skillId: string) => myResults.some(r => r.skill?._id === skillId && r.status === 'passed');

  const handleTakeExam = async (skill: any) => {
    const exam = EXAMS[skill._id];
    if (!exam) return alert('No exam available for this skill yet.');
    setLoadingExam(skill._id);
    await new Promise(r => setTimeout(r, 400));
    setActiveExam(exam);
    setActiveExamSkill(skill);
    setLoadingExam(null);
  };

  const handleExamComplete = (result: ExamResult) => {
    setMyResults(prev => [...prev, result]);
    // If passed, add to skillsOffered
    if (result.status === 'passed' && user && activeExamSkill) {
      const exists = user.skillsOffered.some((s: any) => (s._id || s) === activeExamSkill._id);
      if (!exists) setUser({ ...user, skillsOffered: [...user.skillsOffered, activeExamSkill] });
    }
  };

  const filtered = SKILLS.filter(s => {
    const catMatch = activeCategory === 'All' || s.category === activeCategory;
    const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="page">
      {activeExam && user && (
        <ExamModal
          exam={activeExam} skillName={activeExamSkill?.name || ''} skillId={activeExamSkill?._id || ''}
          userId={user._id}
          onClose={() => { setActiveExam(null); setActiveExamSkill(null); }}
          onComplete={handleExamComplete}
        />
      )}

      <div style={{ marginBottom: 28 }}>
        <h1>Skills &amp; Verification</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Pass a proctored skill exam to become a verified teacher. Your camera is active during the exam.</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-input" placeholder="🔍 Search skills…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</button>
        ))}
      </div>

      <div className="grid-auto">
        {filtered.map(skill => {
          const result = getMyResult(skill._id);
          const passed = hasPassed(skill._id);
          const hasExam = !!EXAMS[skill._id];
          return (
            <div key={skill._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.75rem' }}>{skill.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{skill.category}</div>
                </div>
                {passed && <span className="badge badge-verified">✓ Verified</span>}
              </div>
              {skill.description && <p style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>{skill.description}</p>}
              {result && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last attempt</span>
                    <span className={`badge badge-${result.status === 'passed' ? 'success' : 'danger'}`}>{result.status === 'passed' ? '✓ Passed' : `✗ ${result.scorePercent}%`}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ width: `${result.scorePercent}%`, height: '100%', background: result.status === 'passed' ? 'var(--success)' : 'var(--danger)', borderRadius: 99 }} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {!passed && hasExam && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>📹 Camera required</div>}
                {!hasExam && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No exam yet</div>}
                <button
                  className={`btn btn-sm ${passed ? 'btn-ghost' : hasExam ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={loadingExam === skill._id || passed || !hasExam}
                  onClick={() => !passed && hasExam && handleTakeExam(skill)}
                  style={{ marginLeft: 'auto' }}
                >
                  {loadingExam === skill._id ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Loading…</>
                    : passed ? '✓ Exam Passed'
                    : !hasExam ? 'Coming Soon'
                    : result ? '🔄 Retake Exam' : '📝 Take Exam'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No skills found</div>
          <div className="empty-desc">Try a different search or category</div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
