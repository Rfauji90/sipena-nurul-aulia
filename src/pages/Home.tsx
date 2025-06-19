import { Link } from 'react-router-dom';
import { BookOpen, ChartBar, ClipboardList, FileText, School, Users } from 'lucide-react';

const Home = () => {
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

          {/* Terms & Conditions Card */}
          <Link to="/terms" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex space-x-4 items-center border border-blue-100">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText size={28} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Syarat & Ketentuan</h3>
              <p className="text-sm text-gray-600">Ketentuan penggunaan aplikasi</p>
            </div>
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
