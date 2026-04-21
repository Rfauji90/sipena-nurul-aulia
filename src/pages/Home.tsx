import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ChartBar, 
  ClipboardList, 
  FileText, 
  School, 
  Users, 
  Play, 
  Zap, 
  Cloud, 
  ArrowRight,
  Monitor,
  Layout,
  BarChart3,
  Search,
  Star
} from 'lucide-react';

// Create a unified interface for all types of updates
const Home = () => {
  return (
    <div className="space-y-8">
      {/* Advanced Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto py-8 lg:py-16">
        {/* Left Side: Text Details */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-2 opacity-90">
            <Star size={16} className="mr-2" />
            100% Cepat • Efisien • Terintegrasi 🇮🇩
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Supervisi Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 flex-none relative inline-block">Modern</span><br/> untuk Sekolah
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Kelola penjadwalan, laporan mengajar, dan nilai supervisi guru secara otomatis langsung dari HP/Laptop. Tanpa repot mengurus kertas, tanpa ribet, lebih terpusat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link to="/dashboard" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center w-full sm:w-auto">
              Mulai Sekarang — Gratis! <ArrowRight size={20} className="ml-2" />
            </Link>
            <a href="#tutor" className="px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full shadow-sm transition-all flex items-center justify-center w-full sm:w-auto">
              Lihat Fitur
            </a>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 font-medium pt-4">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Tanpa install</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>Aman di cloud</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>Akses dimana saja</span>
          </div>
        </div>

        {/* Right Side: Phone Mockup */}
        <div className="flex-1 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none mx-auto relative flex justify-center lg:justify-end animate-fadeIn">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-[80px] opacity-70 transform translate-x-10 translate-y-10 w-[300px] h-[300px] right-0 z-0"></div>
          <div className="absolute inset-0 bg-indigo-100 rounded-full blur-[80px] opacity-50 transform -translate-x-10 translate-y-20 w-[200px] h-[200px] left-0 z-0"></div>
          
          <div className="relative border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[550px] w-[270px] shadow-2xl overflow-hidden z-10 flex-shrink-0 animate-float transform rotate-2 lg:rotate-3 transition-transform hover:rotate-0 duration-500">
            {/* Notch */}
            <div className="w-[120px] h-[22px] bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[1rem] z-20"></div>
            
            {/* Screen */}
            <div className="bg-gray-50 w-full h-full p-5 overflow-hidden relative flex flex-col">
              {/* Status Bar */}
              <div className="flex justify-between items-center text-[11px] text-gray-600 mb-5 font-bold pt-1">
                <span>9:41</span>
                <span>100%</span>
              </div>
              
              {/* Header */}
              <div className="mb-5 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SIPENA</div>
                  <div className="font-bold text-gray-800 text-sm">Supervisi Nurul Aulia</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  NA
                </div>
              </div>
              
              {/* Mock Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 flex items-center mb-6 text-xs text-gray-400">
                <Search size={14} className="mr-2 text-gray-400" /> Cari menu atau data guru...
              </div>
              
              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold flex-1">
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                  <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <ChartBar size={22} />
                  </div>
                  <span>Dashboard</span>
                </div>
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                  <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <Users size={22} />
                  </div>
                  <span>Data Guru</span>
                </div>
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                  <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <ClipboardList size={22} />
                  </div>
                  <span>ADM</span>
                </div>
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50 transition-colors">
                  <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                    <BookOpen size={22} />
                  </div>
                  <span>KBM</span>
                </div>
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                  <div className="p-3 bg-red-50 rounded-full text-red-600">
                    <School size={22} />
                  </div>
                  <span>Klasik</span>
                </div>
                <div className="bg-white text-gray-700 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <FileText size={22} />
                  </div>
                  <span>Catatan KS</span>
                </div>
              </div>
              
              {/* Bottom Nav Mock */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-medium px-2">
                <div className="flex flex-col items-center text-blue-600">
                  <Layout size={18} />
                  <span className="mt-1">Beranda</span>
                </div>
                <div className="flex flex-col items-center">
                  <Monitor size={18} />
                  <span className="mt-1">Laporan</span>
                </div>
                <div className="flex flex-col items-center">
                  <FileText size={18} />
                  <span className="mt-1">Catatan</span>
                </div>
              </div>

              {/* Floating Action Button Alerts */}
              <div className="absolute bottom-[4.5rem] right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/40">
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">1</div>
                <BookOpen size={20} />
              </div>
            </div>
          </div>
        </div>
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

      {/* Tutorial / Tutor Section */}
      <div id="tutor" className="space-y-6 max-w-4xl mx-auto pt-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          <span className="mr-3 p-2 bg-blue-100 rounded-lg text-blue-600"><Play size={24} fill="currentColor" /></span>
          Panduan Penggunaan (Tutor)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-blue-500 hover:transform hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold mb-4">1</div>
            <h4 className="font-bold text-gray-800 mb-2">Login Akun</h4>
            <p className="text-sm text-gray-600">Masuk menggunakan akun administrator untuk mengakses seluruh fitur navigasi.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-green-500 hover:transform hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 font-bold mb-4">2</div>
            <h4 className="font-bold text-gray-800 mb-2">Kelola Data Guru</h4>
            <p className="text-sm text-gray-600">Pastikan data guru sudah terdaftar sesuai dengan unit masing-masing (RA, SD, SMP).</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-yellow-500 hover:transform hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 font-bold mb-4">3</div>
            <h4 className="font-bold text-gray-800 mb-2">Input Supervisi</h4>
            <p className="text-sm text-gray-600">Pilih jenis supervisi (ADM, KBM, atau Klasik) dan masukkan nilai serta catatan guru.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-purple-500 hover:transform hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">4</div>
            <h4 className="font-bold text-gray-800 mb-2">Lihat Dashboard</h4>
            <p className="text-sm text-gray-600">Pantau grafik perkembangan dan download laporan hasil supervisi secara berkala.</p>
          </div>
        </div>
      </div>

      {/* Keunggulan Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-50 max-w-4xl mx-auto">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Mengapa Digitalisasi dengan Sipena?</h2>
          <p className="text-blue-100 mt-2">Membawa administrasi sekolah ke level yang lebih modern dan efisien.</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
              <Zap size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Efisiensi Tinggi</h3>
            <p className="text-gray-600 text-sm italic">"Mengurangi beban administratif kertas dan mempercepat proses pelaporan hingga 80%."</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 border-x border-gray-100 px-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Cloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Penyimpanan Terpusat</h3>
            <p className="text-gray-600 text-sm italic">"Semua data guru dan riwayat supervisi tersimpan aman di cloud, akses kapan saja dan di mana saja."</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Analisis Akurat</h3>
            <p className="text-gray-600 text-sm italic">"Visualisasi data dalam bentuk grafik membantu pimpinan mengambil keputusan berbasis data yang nyata."</p>
          </div>
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