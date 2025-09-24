import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Archive, BookOpen, ChartBar, ChevronDown, ClipboardList, FileText, House, LogOut, Menu, School, Users, X, NotebookPen } from 'lucide-react';
import { useAuth } from '../utils/authContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userRole, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      {/* Top Navigation */}
      <header className="bg-blue-700 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="https://mocha-cdn.com/01957e34-b544-71cb-aada-991d152984fd/icon-yna.png" 
                  alt="Yayasan Nurul Aulia Logo" 
                  className="h-10 w-10 mr-3"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">SiPeNa</h1>
                  <span className="text-sm text-white">Sistem Pengelolaan Nilai Supervisi Nurul Aulia</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 items-center">
              <Link to="/" className={`nav-link text-white hover:bg-blue-600 ${isActive('/')}`}>
                <House className="mr-2 h-5 w-5" />
                <span>Beranda</span>
              </Link>
              <Link to="/dashboard" className={`nav-link text-white hover:bg-blue-600 ${isActive('/dashboard')}`}>
                <ChartBar className="mr-2 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/teacher-data" className={`nav-link text-white hover:bg-blue-600 ${isActive('/teacher-data')}`}>
                <Users className="mr-2 h-5 w-5" />
                <span>Data Guru</span>
              </Link>
              <Link to="/archived-teachers" className={`nav-link text-white hover:bg-blue-600 ${isActive('/archived-teachers')}`}>
                <Archive className="mr-2 h-5 w-5" />
                <span>Arsip Guru</span>
              </Link>
              <div className="relative dropdown">
                <button className="nav-link text-white hover:bg-blue-600 flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  <span>Supervisi</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="dropdown-content z-10">
                  <Link to="/admin-supervision" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Supervisi ADM
                  </Link>
                  <Link to="/kbm-supervision" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Supervisi KBM
                  </Link>
                  <Link to="/classic-supervision" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Supervisi Klasik
                  </Link>
                </div>
              </div>
              <Link to="/headmaster-notes" className={`nav-link text-white hover:bg-blue-600 ${isActive('/headmaster-notes')}`}>
                <NotebookPen className="mr-2 h-5 w-5" />
                <span>Catatan KS</span>
              </Link>
              <Link to="/terms" className={`nav-link text-white hover:bg-blue-600 ${isActive('/terms')}`}>
                <FileText className="mr-2 h-5 w-5" />
                <span>Syarat & Ketentuan</span>
              </Link>
              
              {/* User Role & Logout */}
              <div className="ml-4 flex items-center">
                <span className="text-white bg-blue-800 px-2 py-1 rounded-md text-xs mr-2">
                  {userRole === 'admin' ? 'Admin' : 'Tamu'}
                </span>
                <button 
                  onClick={logout}
                  className="text-white hover:bg-blue-600 p-2 rounded-md flex items-center"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-700">
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <House className="mr-3 h-5 w-5" />
                  <span>Beranda</span>
                </div>
              </Link>
              <Link 
                to="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <ChartBar className="mr-3 h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link 
                to="/teacher-data" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/teacher-data') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5" />
                  <span>Data Guru</span>
                </div>
              </Link>
              <Link 
                to="/archived-teachers" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/archived-teachers') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Archive className="mr-3 h-5 w-5" />
                  <span>Arsip Guru</span>
                </div>
              </Link>
              <Link 
                to="/admin-supervision" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin-supervision') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <ClipboardList className="mr-3 h-5 w-5" />
                  <span>Supervisi ADM</span>
                </div>
              </Link>
              <Link 
                to="/kbm-supervision" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/kbm-supervision') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BookOpen className="mr-3 h-5 w-5" />
                  <span>Supervisi KBM</span>
                </div>
              </Link>
              <Link 
                to="/classic-supervision" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/classic-supervision') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <School className="mr-3 h-5 w-5" />
                  <span>Supervisi Klasik</span>
                </div>
              </Link>
              <Link 
                to="/headmaster-notes" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/headmaster-notes') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <NotebookPen className="mr-3 h-5 w-5" />
                  <span>Catatan KS</span>
                </div>
              </Link>
              <Link 
                to="/terms" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/terms') ? 'bg-blue-800 text-white' : 'text-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FileText className="mr-3 h-5 w-5" />
                  <span>Syarat & Ketentuan</span>
                </div>
              </Link>
              
              {/* Mobile Logout Button */}
              <button 
                onClick={logout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Keluar ({userRole === 'admin' ? 'Admin' : 'Tamu'})</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <main>
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">Developed By ITBidPend 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
