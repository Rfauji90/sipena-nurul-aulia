import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChartBar, ClipboardList, FileText, School, Users } from 'lucide-react';
import { 
  getAdminSupervisions,
  getKBMSupervisions,
  getClassicSupervisions,
  getHeadmasterNotes,
  getTeachers,
  Supervision,
  HeadmasterNote,
  Teacher
} from '../utils/helpers';

// Create a unified interface for all types of updates
interface RecentUpdate {
  id: string;
  teacherId?: string;
  teacherName: string;
  unit?: string;
  date: string;
  score?: number;
  grade?: string;
  notes?: string;
  type: string;
  // For HeadmasterNote specific fields
  categories?: string[];
  note?: string;
}

const Home = () => {
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentUpdates();
  }, []);

  // Add a function to manually refresh updates
  const refreshUpdates = () => {
    loadRecentUpdates();
  };

  const loadRecentUpdates = async () => {
    setLoading(true);
    try {
      // Load all types of supervisions
      const adminSupervisions = await getAdminSupervisions();
      const kbmSupervisions = await getKBMSupervisions();
      const classicSupervisions = await getClassicSupervisions();
      const headmasterNotes = await getHeadmasterNotes();
      const teachers = await getTeachers();

      // Debug: Log the data to see what we're working with
      console.log('Admin Supervisions:', adminSupervisions);
      console.log('KBM Supervisions:', kbmSupervisions);
      console.log('Classic Supervisions:', classicSupervisions);
      console.log('Headmaster Notes:', headmasterNotes);
      console.log('Teachers:', teachers);

      // Create a map of teacher ID to teacher for quick lookup
      const teacherMap = new Map<string, Teacher>();
      teachers.forEach(teacher => {
        teacherMap.set(teacher.id, teacher);
      });

      // Combine all updates with type information
      const allUpdates: RecentUpdate[] = [
        ...adminSupervisions.map(s => ({ ...s, type: 'ADM' })),
        ...kbmSupervisions.map(s => ({ ...s, type: 'KBM' })),
        ...classicSupervisions.map(s => ({ ...s, type: 'Klasik' })),
        ...headmasterNotes.map(n => {
          // Find the teacher to get their unit
          const teacher = teacherMap.get(n.teacherId);
          return {
            id: n.id,
            teacherId: n.teacherId,
            teacherName: n.teacherName,
            date: n.date,
            type: 'KS',
            note: n.note,
            categories: n.categories,
            unit: teacher ? teacher.unit : undefined
          };
        })
      ];

      // Debug: Log combined updates
      console.log('All Updates:', allUpdates);

      // Sort by date (newest first) and take the 5 most recent
      // More robust date sorting that handles different date formats
      const sorted = allUpdates.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Check if dates are valid
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 5);

      // Debug: Log sorted updates
      console.log('Sorted Updates:', sorted);

      setRecentUpdates(sorted);
    } catch (error) {
      console.error("Error loading recent updates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the update type name
  const getUpdateTypeName = (type: string) => {
    switch (type) {
      case 'ADM': return 'Administrasi';
      case 'KBM': return 'Kegiatan Belajar Mengajar';
      case 'Klasik': return 'Klasik';
      case 'KS': return 'Catatan KS';
      default: return type;
    }
  };

  // Function to get the update type color
  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'ADM': return 'bg-purple-100 text-purple-800';
      case 'KBM': return 'bg-yellow-100 text-yellow-800';
      case 'Klasik': return 'bg-red-100 text-red-800';
      case 'KS': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl shadow-xl p-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-3">Selamat Datang di SiPeNa</h1>
        <p className="text-xl mb-4">Sistem Pengelolaan Nilai Supervisi Nurul Aulia</p>
        <p className="text-blue-100 max-w-2xl mx-auto">
          Aplikasi ini dirancang untuk memudahkan proses pengelolaan dan pelaporan 
          supervisi guru, memastikan kualitas pengajaran yang optimal di seluruh unit.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Menu Aplikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Dashboard Card */}
          <Link to="/dashboard" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ChartBar size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Dashboard</h3>
              <p className="text-sm text-gray-600">Statistik dan overview supervisi</p>
            </div>
          </Link>

          {/* Data Guru Card */}
          <Link to="/teacher-data" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Data Guru</h3>
              <p className="text-sm text-gray-600">Kelola data guru dan pengajar</p>
            </div>
          </Link>

          {/* Admin Supervision Card */}
          <Link to="/admin-supervision" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ClipboardList size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Supervisi ADM</h3>
              <p className="text-sm text-gray-600">Kelola penilaian administrasi</p>
            </div>
          </Link>

          {/* KBM Supervision Card */}
          <Link to="/kbm-supervision" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BookOpen size={28} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Supervisi KBM</h3>
              <p className="text-sm text-gray-600">Kelola penilaian kegiatan mengajar</p>
            </div>
          </Link>

          {/* Classic Supervision Card */}
          <Link to="/classic-supervision" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-red-100 p-3 rounded-lg">
              <School size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Supervisi Klasik</h3>
              <p className="text-sm text-gray-600">Kelola penilaian klasikal</p>
            </div>
          </Link>

          {/* Headmaster Notes (Penilaian KS) Card - NEW SHORTCUT */}
          <Link to="/headmaster-notes" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText size={28} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Penilaian KS</h3>
              <p className="text-sm text-gray-600">Catatan Kepala Sekolah</p>
            </div>
          </Link>

          {/* Terms & Conditions Card - HIDDEN (commented out)
          <Link to="/terms" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText size={28} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Syarat & Ketentuan</h3>
              <p className="text-sm text-gray-600">Ketentuan penggunaan aplikasi</p>
            </div>
          </Link>
          */}
        </div>
      </div>

      {/* Recent Updates Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-800 flex items-center">
            <span className="mr-2">🔔</span> Update Terbaru
          </h2>
          <button 
            onClick={refreshUpdates}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Memuat update terbaru...</p>
          </div>
        ) : recentUpdates.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 italic">Belum ada update supervisi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Pendidikan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Supervisi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu Pengisian</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUpdates.map((update, index) => (
                  <tr key={update.id} className="hover:bg-blue-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{update.teacherName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{update.unit || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUpdateTypeColor(update.type)}`}>
                        {getUpdateTypeName(update.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(update.date).toLocaleDateString('id-ID')} - {new Date(update.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link to="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">
            Lihat semua update →
          </Link>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mt-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Tentang Aplikasi</h2>
        <p className="text-gray-700 max-w-3xl mx-auto">
          SiPeNa digunakan untuk memantau kualitas pembelajaran melalui 
          supervisi yang sistematis. Aplikasi ini memudahkan dokumentasi, analisis, 
          dan visualisasi nilai supervisi di seluruh unit RA, SD, dan SMP.
        </p>
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">
            Lihat statistik terbaru →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;