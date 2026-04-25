import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'learner' | 'teacher' | 'both';
  college?: string;
  bio?: string;
  avatarUrl?: string;
  skillsOffered: any[];
  skillsWanted: any[];
  ratingAvg: number;
  ratingCount: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, college?: string, role?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'ss_user';
const TOKEN_KEY = 'ss_token';

// Simulate stored users
const getStoredUsers = (): User[] => {
  try { return JSON.parse(localStorage.getItem('ss_users') || '[]'); } catch { return []; }
};
const saveUser = (u: User) => {
  const users = getStoredUsers().filter(x => x._id !== u._id);
  localStorage.setItem('ss_users', JSON.stringify([...users, u]));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedToken && storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {}
    }
    setLoading(false);
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    saveUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const users = getStoredUsers();
    const found = users.find(u => u.email === email);
    if (!found) throw new Error('Invalid credentials');
    const passwords = JSON.parse(localStorage.getItem('ss_passwords') || '{}');
    if (passwords[email] !== password) throw new Error('Invalid credentials');
    const tkn = `mock_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, tkn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    setToken(tkn);
    setUserState(found);
    return found;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, college?: string, role?: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 600));
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    const newUser: User = {
      _id: `u_${Date.now()}`, name, email,
      role: (role || 'learner') as User['role'],
      college, bio: '', avatarUrl: '',
      skillsOffered: [], skillsWanted: [],
      ratingAvg: 0, ratingCount: 0,
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    const passwords = JSON.parse(localStorage.getItem('ss_passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('ss_passwords', JSON.stringify(passwords));
    const tkn = `mock_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, tkn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setToken(tkn);
    setUserState(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUserState(null);
    loadedRef.current = false;
  }, []);

  const refreshUser = useCallback(async () => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try { setUserState(JSON.parse(storedUser)); } catch {}
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
