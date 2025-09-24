import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, ErrorInfo, Component, ReactNode } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TeacherData from './pages/TeacherData';
import ArchivedTeachers from './pages/ArchivedTeachers';
import AdminSupervision from './pages/AdminSupervision';
import KBMSupervision from './pages/KBMSupervision';
import ClassicSupervision from './pages/ClassicSupervision';
import Terms from './pages/Terms';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './utils/authContext';
import './index.css';
import HeadmasterNotes from './pages/HeadmasterNotes';

// Error Boundary Component
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h2>
            <p className="text-gray-600">Maaf, terjadi kesalahan pada aplikasi.</p>
            <p className="text-sm text-gray-500">{this.state.error?.message}</p>
            <button 
              onClick={() => {
                localStorage.removeItem('auth'); // Reset auth state
                window.location.href = '/login'; // Redirect to login
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    // Include required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher-data" element={
              <ProtectedRoute>
                <Layout>
                  <TeacherData />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/archived-teachers" element={
              <ProtectedRoute>
                <Layout>
                  <ArchivedTeachers />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin-supervision" element={
              <ProtectedRoute>
                <Layout>
                  <AdminSupervision />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/kbm-supervision" element={
              <ProtectedRoute>
                <Layout>
                  <KBMSupervision />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/classic-supervision" element={
              <ProtectedRoute>
                <Layout>
                  <ClassicSupervision />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/terms" element={
              <ProtectedRoute>
                <Layout>
                  <Terms />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/headmaster-notes" element={
              <ProtectedRoute>
                <Layout>
                  <HeadmasterNotes />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Redirect to login for any unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
