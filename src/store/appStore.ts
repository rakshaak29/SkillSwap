// ── Client-side mock store using localStorage ─────────────────────────────────
import { TEACHERS, SKILLS } from '../data/mockData';
import { generateId } from '../utils/helpers';

export interface Message {
  _id: string;
  sessionId: string;
  sender: { _id: string; name: string; avatarUrl?: string };
  text: string;
  flagged: boolean;
  modLabel: string;
  reason?: string;
  sentAt: string;
  createdAt: string;
}

export interface Session {
  _id: string;
  userA: any;
  userB: any;
  learnSkill: any;
  teachSkill: any;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  warningsCount: number;
  moderationStatus: 'clean' | 'warned' | 'flagged';
  createdAt: string;
  updatedAt: string;
  request?: string;
}

export interface SwapRequest {
  _id: string;
  fromUser: any;
  toUser: any;
  learnSkill: any;
  teachSkill?: any;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ExamResult {
  _id: string;
  user: string;
  exam: string;
  skill: any;
  attemptNo: number;
  scorePercent: number;
  status: 'passed' | 'failed';
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  refId?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  session: string;
  reviewer: any;
  reviewee: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ── Storage helpers ────────────────────────────────────────────────────────────
const get = <T>(key: string, def: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; }
};
const set = <T>(key: string, val: T) => localStorage.setItem(key, JSON.stringify(val));

// ── Sessions ──────────────────────────────────────────────────────────────────
export const getSessions = (): Session[] => get<Session[]>('ss_sessions', []);
const saveSessions = (s: Session[]) => set('ss_sessions', s);

export const getMySessions = (userId: string): Session[] =>
  getSessions().filter(s => s.userA?._id === userId || s.userB?._id === userId);

export const getSessionById = (id: string): Session | null =>
  getSessions().find(s => s._id === id) || null;

export const createSession = (data: Partial<Session>): Session => {
  const session: Session = {
    _id: generateId(), status: 'active', warningsCount: 0,
    moderationStatus: 'clean', createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), ...data,
  } as Session;
  const sessions = getSessions();
  saveSessions([session, ...sessions]);
  return session;
};

export const updateSession = (id: string, update: Partial<Session>): Session | null => {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s._id === id);
  if (idx === -1) return null;
  sessions[idx] = { ...sessions[idx], ...update, updatedAt: new Date().toISOString() };
  saveSessions(sessions);
  return sessions[idx];
};

export const createDemoSession = (currentUser: any): Session => {
  const teacher = TEACHERS.find(t => t._id !== currentUser._id) || TEACHERS[0];
  const skill = SKILLS[0];
  return createSession({
    userA: currentUser,
    userB: teacher,
    learnSkill: skill,
    teachSkill: skill,
    status: 'active',
  });
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const getMessages = (sessionId: string): Message[] =>
  get<Message[]>(`ss_msgs_${sessionId}`, []);

export const addMessage = (sessionId: string, msg: Message): Message[] => {
  const msgs = getMessages(sessionId);
  const updated = [...msgs, msg];
  set(`ss_msgs_${sessionId}`, updated);
  return updated;
};

// ── Requests ──────────────────────────────────────────────────────────────────
export const getRequests = (): SwapRequest[] => get<SwapRequest[]>('ss_requests', []);
const saveRequests = (r: SwapRequest[]) => set('ss_requests', r);

export const getMyRequests = (userId: string) => {
  const all = getRequests();
  return {
    sent: all.filter(r => r.fromUser?._id === userId),
    received: all.filter(r => r.toUser?._id === userId),
  };
};

export const createRequest = (data: Partial<SwapRequest>): SwapRequest => {
  const req: SwapRequest = {
    _id: generateId(), status: 'pending',
    createdAt: new Date().toISOString(), ...data,
  } as SwapRequest;
  saveRequests([req, ...getRequests()]);
  addNotification({
    user: data.toUser?._id || '',
    type: 'swap_request', title: 'New Swap Request',
    body: `${data.fromUser?.name} wants to learn from you!`,
    refId: req._id,
  });
  return req;
};

export const updateRequestStatus = (id: string, status: 'accepted' | 'rejected', currentUser: any): { request: SwapRequest; session: Session | null } => {
  const reqs = getRequests();
  const idx = reqs.findIndex(r => r._id === id);
  if (idx === -1) throw new Error('Request not found');
  reqs[idx] = { ...reqs[idx], status };
  saveRequests(reqs);
  let session: Session | null = null;
  if (status === 'accepted') {
    session = createSession({
      userA: reqs[idx].fromUser,
      userB: reqs[idx].toUser,
      learnSkill: reqs[idx].learnSkill,
      teachSkill: reqs[idx].teachSkill,
      status: 'active',
      request: id,
    });
    addNotification({
      user: reqs[idx].fromUser?._id,
      type: 'request_accepted', title: 'Request Accepted! 🎉',
      body: `${currentUser.name} accepted your swap request. Session is ready!`,
      refId: session._id,
    });
  }
  return { request: reqs[idx], session };
};

// ── Exam Results ──────────────────────────────────────────────────────────────
export const getExamResults = (userId: string): ExamResult[] =>
  get<ExamResult[]>('ss_results', []).filter(r => r.user === userId);

export const saveExamResult = (result: ExamResult) => {
  const all = get<ExamResult[]>('ss_results', []);
  set('ss_results', [...all, result]);
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (userId: string): Notification[] =>
  get<Notification[]>('ss_notifs', []).filter(n => n.user === userId);

export const addNotification = (data: Partial<Notification>) => {
  const notifs = get<Notification[]>('ss_notifs', []);
  const notif: Notification = {
    _id: generateId(), isRead: false,
    createdAt: new Date().toISOString(), ...data,
  } as Notification;
  set('ss_notifs', [notif, ...notifs]);
};

export const markNotificationRead = (id: string) => {
  const notifs = get<Notification[]>('ss_notifs', []);
  const updated = notifs.map(n => n._id === id ? { ...n, isRead: true } : n);
  set('ss_notifs', updated);
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const getReviews = (revieweeId: string): Review[] =>
  get<Review[]>('ss_reviews', []).filter(r => r.reviewee === revieweeId);

export const addReview = (data: Partial<Review>): Review => {
  const all = get<Review[]>('ss_reviews', []);
  const review: Review = {
    _id: generateId(), createdAt: new Date().toISOString(), ...data,
  } as Review;
  set('ss_reviews', [review, ...all]);
  return review;
};

export const hasReviewed = (sessionId: string, reviewerId: string): boolean =>
  get<Review[]>('ss_reviews', []).some(r => r.session === sessionId && r.reviewer?._id === reviewerId);
