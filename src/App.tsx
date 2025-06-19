import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TeacherData from './pages/TeacherData';
import AdminSupervision from './pages/AdminSupervision';
import KBMSupervision from './pages/KBMSupervision';
import ClassicSupervision from './pages/ClassicSupervision';
import Terms from './pages/Terms';
import './index.css';

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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacher-data" element={<TeacherData />} />
          <Route path="/admin-supervision" element={<AdminSupervision />} />
          <Route path="/kbm-supervision" element={<KBMSupervision />} />
          <Route path="/classic-supervision" element={<ClassicSupervision />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
