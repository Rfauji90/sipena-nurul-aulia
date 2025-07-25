import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'guest' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  // Cek status autentikasi dari localStorage saat aplikasi dimuat
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(authData.isAuthenticated);
        setUserRole(authData.userRole);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      // Reset auth state jika terjadi error
      localStorage.removeItem('auth');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  // Simpan status autentikasi ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem('auth', JSON.stringify({ isAuthenticated, userRole }));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }, [isAuthenticated, userRole]);

  const login = (username: string, password: string): boolean => {
    // Validasi kredensial admin
    if (username === 'admin' && password === 'sipena25') {
      setIsAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const loginAsGuest = () => {
    setIsAuthenticated(true);
    setUserRole('guest');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};