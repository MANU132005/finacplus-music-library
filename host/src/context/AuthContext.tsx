import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'music_library_auth_token';
const USER_KEY = 'music_library_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate auth state from localStorage on startup
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    // Simulate minor network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    let authenticatedUser: User | null = null;

    if (username === 'admin' && password === 'admin123') {
      authenticatedUser = { username: 'admin', role: 'admin' };
    } else if (username === 'user' && password === 'user123') {
      authenticatedUser = { username: 'user', role: 'user' };
    }

    if (authenticatedUser) {
      // Mock JWT generation
      const mockJwt = `mock-jwt-header.${btoa(JSON.stringify(authenticatedUser))}.mock-signature`;
      setToken(mockJwt);
      setUser(authenticatedUser);
      localStorage.setItem(TOKEN_KEY, mockJwt);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      setLoading(false);
      return true;
    }

    setLoading(false);
    throw new Error('Invalid username or password');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
