import { useState, useEffect } from 'react';
import { 
  Teacher, 
  Supervision, 
  getTeachers, 
  getKBMSupervisions, 
  saveKBMSupervision,
  deleteKBMSupervision,
  calculateGrade
} from '../utils/helpers';
import { Eye, Filter, Pencil, Search, Trash, X, Download, BookOpen, ClipboardList, TrendingUp, BarChart3, FileText, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateSupervisionPDF } from '../utils/exportUtils';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const KBMSupervision = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [formData, setFormData] = useState<Partial<Supervision>>({
    teacherId: '',
    teacherName: '',
    date: '',
    score: 0,
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewGrade, setPreviewGrade] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | ''>('');
  const [yearFilter, setYearFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [_selectedTeacherGender, setSelectedTeacherGender] = useState<'male' | 'female' | ''>('');

  useEffect(() => {
    loadData();
  }, [unitFilter]);

  useEffect(() => {
    if (formData.score) {
      setPreviewGrade(calculateGrade(formData.score));
    } else {
      setPreviewGrade('');
    }
  }, [formData.score]);

  useEffect(() => {
    const filtered = teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teacherSearch, teachers]);

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedTeachers = await getTeachers();
      setTeachers(loadedTeachers);
      setFilteredTeachers(loadedTeachers);
      
      const loadedSupervisions = await getKBMSupervisions(unitFilter as 'RA' | 'SD' | 'SMP' | undefined);
      
      // Enrich supervisions with teacher gender and filter out archived ones
      const enrichedSupervisions = loadedSupervisions
        .filter(supervision => loadedTeachers.some(t => t.id === supervision.teacherId))
        .map(supervision => {
          const teacher = loadedTeachers.find(t => t.id === supervision.teacherId);
          return {
            ...supervision,
            teacherGender: teacher ? teacher.gender : 'male'
          };
        });
      
      setSupervisions(enrichedSupervisions);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'teacherId') {
      const selectedTeacher = teachers.find(t => t.id === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        teacherName: selectedTeacher ? selectedTeacher.name : ''
      }));
      if (selectedTeacher) {
        setSelectedTeacherGender(selectedTeacher.gender);
      }
    } else if (name === 'score') {
      const score = parseInt(value);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        setFormData(prev => ({ ...prev, [name]: score }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTeacherSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacherSearch(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacherId || !formData.date || formData.score === undefined || formData.notes === undefined) {
      alert('Semua field harus diisi');
      return;
    }

    setLoading(true);
    try {
      await saveKBMSupervision(formData as Supervision);
      
      setFormData({
        teacherId: '',
        teacherName: '',
        date: '',
        score: 0,
        notes: ''
      });

      setIsEditing(false);
      
      // Trigger confetti on success
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#34d399']
      });

      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supervision: Supervision) => {
    setFormData(supervision);
    setIsEditing(true);
    setShowForm(true);
    
    // Get teacher gender for the selected supervision
    const teacher = teachers.find(t => t.id === supervision.teacherId);
    if (teacher) {
      setSelectedTeacherGender(teacher.gender);
    }
  };

  const handleDetail = (supervision: Supervision) => {
    setSelectedSupervision(supervision);
    setShowDetailModal(true);
  };

  const handleDownloadPDF = (supervision: Supervision) => {
    const teacher = teachers.find(t => t.id === supervision.teacherId);
    if (teacher) {
      generateSupervisionPDF(supervision, teacher, 'KBM');
    } else {
      alert('Data guru tidak ditemukan untuk laporan ini.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setLoading(true);
      try {
        await deleteKBMSupervision(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting supervision:", error);
        alert("Terjadi kesalahan saat menghapus data.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      teacherId: '',
      teacherName: '',
      date: '',
      score: 0,
      notes: ''
    });
    setIsEditing(false);
    setSelectedTeacherGender('');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitFilter(e.target.value as 'RA' | 'SD' | 'SMP' | '');
  };

  const handleReadMore = (note: string) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  // Derived state for filtering and stats
  const availableYears = Array.from(new Set(supervisions.map(s => s.date ? s.date.substring(0, 4) : '')))
    .filter(Boolean)
    .sort((a, b) => parseInt(b) - parseInt(a));

  const filteredSupervisions = supervisions.filter(s => 
    yearFilter.length === 0 || (s.date && yearFilter.includes(s.date.substring(0, 4)))
  );

  const stats = {
    A: filteredSupervisions.filter(s => s.grade === 'A').length,
    B: filteredSupervisions.filter(s => s.grade === 'B').length,
    C: filteredSupervisions.filter(s => s.grade === 'C').length,
    D: filteredSupervisions.filter(s => s.grade === 'D').length,
  };

  // Calculate supervision counts per teacher (based on filtered data)
  const supervisionCounts = filteredSupervisions.reduce((acc, curr) => {
    acc[curr.teacherId] = (acc[curr.teacherId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BookOpen className="mr-3 text-blue-600" size={28} />
          Supervisi KBM
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex space-x-1 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <ClipboardList size={16} className="mr-2" />
              Daftar
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <BarChart3 size={16} className="mr-2" />
              Dashboard
            </button>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
                setShowForm(false);
              } else {
                setShowForm(true);
                setActiveTab('list');
              }
            }}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {showForm ? (
              <>
                <X size={18} className="mr-2" />
                Tutup Form
              </>
            ) : (
              <>
                <ClipboardList size={18} className="mr-2" />
                Tambah Supervisi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shared Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Filter size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Unit</span>
            <select
              value={unitFilter}
              onChange={handleFilterChange}
              className="border-none p-0 pr-8 text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer bg-transparent"
              disabled={loading}
            >
              <option value="">Semua Unit</option>
              <option value="RA">Unit RA</option>
              <option value="SD">Unit SD</option>
              <option value="SMP">Unit SMP</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <TrendingUp size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Filter Tahun</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    if (yearFilter.includes(year)) {
                      setYearFilter(yearFilter.filter(y => y !== year));
                    } else {
                      setYearFilter([...yearFilter, year]);
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    yearFilter.includes(year)
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {year}
                </button>
              ))}
              {yearFilter.length > 0 && (
                <button
                  onClick={() => setYearFilter([])}
                  className="px-2 py-1 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            {isEditing ? 'Edit Supervisi KBM' : 'Tambah Supervisi KBM'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nama Guru
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Cari nama guru..."
                    value={teacherSearch}
                    onChange={handleTeacherSearch}
                    className="w-full p-2 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Pilih Guru</option>
                  {filteredTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.unit} ({teacher.gender === 'male' ? 'L' : 'P'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Tanggal Supervisi
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nilai Supervisi (0-100)
                </label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {previewGrade && (
                  <div className="mt-2">
                    <span className="text-sm">
                      Grade: <span className="font-semibold">{previewGrade}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan catatan"
                  disabled={loading}
                ></textarea>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : isEditing ? 'Update' : 'Simpan'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleCancel();
                    setShowForm(false);
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 opacity-50"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 relative z-10">Grade A</span>
          <span className="text-4xl font-black text-green-600 relative z-10">{stats.A}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 opacity-50"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 relative z-10">Grade B</span>
          <span className="text-4xl font-black text-blue-600 relative z-10">{stats.B}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 opacity-50"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 relative z-10">Grade C</span>
          <span className="text-4xl font-black text-yellow-600 relative z-10">{stats.C}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 opacity-50"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 relative z-10">Grade D</span>
          <span className="text-4xl font-black text-red-600 relative z-10">{stats.D}</span>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-blue-700 flex items-center">
              <BookOpen className="mr-2" />
              Daftar Supervisi KBM
            </h2>
          </div>
        
        {loading && supervisions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 animate-pulse">Memuat data supervisi...</p>
          </div>
        ) : supervisions.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 italic">Belum ada data supervisi untuk unit ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSupervisions.map((supervision, index) => (
                  <tr key={supervision.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{supervision.teacherName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      {supervision.teacherGender === 'male' ? 'L' : 'P'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        {supervisionCounts[supervision.teacherId] || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{supervision.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">{supervision.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                        supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                        supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {supervision.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDownloadPDF(supervision)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDetail(supervision)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Dashboard View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <TrendingUp className="mr-2 text-blue-600" size={20} />
                    Tren Kemajuan Supervisi KBM (Per Tahun)
                  </h3>
                  <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Berdasarkan Rata-rata Skor
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  {(() => {
                    const years = yearFilter.length > 0 
                      ? yearFilter.sort() 
                      : Array.from(new Set(supervisions.map(s => s.date ? s.date.substring(0, 4) : ''))).filter(Boolean).sort();

                    if (years.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                          <BarChart3 size={48} className="mb-2 opacity-20" />
                          <p>Data belum tersedia untuk grafik</p>
                        </div>
                      );
                    }

                    const units = unitFilter ? [unitFilter] : ['RA', 'SD', 'SMP'];
                    const unitColors = {
                      RA: { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
                      SD: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                      SMP: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
                    };

                    const datasets = units.map(unit => {
                      const averages = years.map(year => {
                        const unitYearSupervisions = supervisions.filter(s => 
                          s.unit === unit && s.date && s.date.startsWith(year)
                        );
                        if (unitYearSupervisions.length === 0) return null;
                        const sum = unitYearSupervisions.reduce((acc, curr) => acc + curr.score, 0);
                        return (sum / unitYearSupervisions.length).toFixed(1);
                      });

                      return {
                        label: `Unit ${unit}`,
                        data: averages,
                        borderColor: unitColors[unit as keyof typeof unitColors].border,
                        backgroundColor: unitColors[unit as keyof typeof unitColors].bg,
                        fill: false,
                        tension: 0.3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: unitColors[unit as keyof typeof unitColors].border,
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        spanGaps: true
                      };
                    });

                    if (!unitFilter && units.length > 1) {
                      const allAverages = years.map(year => {
                        const yearSupervisions = supervisions.filter(s => s.date && s.date.startsWith(year));
                        if (yearSupervisions.length === 0) return null;
                        const sum = yearSupervisions.reduce((acc, curr) => acc + curr.score, 0);
                        return (sum / yearSupervisions.length).toFixed(1);
                      });

                      datasets.push({
                        label: 'Rata-rata Gabungan',
                        data: allAverages as any,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#6366f1',
                        pointBorderWidth: 1,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        spanGaps: true
                      } as any);
                    }

                    const data = {
                      labels: years,
                      datasets: datasets
                    };

                    const options = {
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index' as const,
                        intersect: false,
                      },
                      plugins: {
                        legend: { 
                          display: true,
                          position: 'top' as const,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12, weight: 'bold' as const }
                          }
                        },
                        tooltip: {
                          backgroundColor: '#1e293b',
                          padding: 12,
                          titleFont: { size: 14 },
                          bodyFont: { size: 13 },
                          cornerRadius: 8,
                          boxPadding: 6
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 0,
                          max: 100,
                          grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          ticks: { 
                            font: { size: 12 },
                            callback: (value: any) => value
                          },
                          title: {
                            display: true,
                            text: 'Skor Rata-rata',
                            font: { size: 12, weight: 'bold' as const }
                          }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 12, weight: 'bold' as const } }
                        }
                      }
                    };

                    return <Line data={data} options={options} />;
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl text-white shadow-md">
                  <h4 className="text-blue-100 text-sm font-medium mb-1">Total Penilaian KBM</h4>
                  <p className="text-3xl font-bold">{supervisions.length}</p>
                  <div className="mt-4 flex items-center text-xs text-blue-100">
                    <Info size={14} className="mr-1" />
                    Berdasarkan filter unit yang aktif
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-gray-500 text-sm font-medium mb-1">Skor KBM Tertinggi</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {supervisions.length > 0 ? Math.max(...supervisions.map(s => s.score)) : 0}
                  </p>
                  <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp size={14} className="mr-1" />
                    Target performa pengajaran: 90+
                  </div>
                </div>
              </div>
            </div>

            {/* Special Report Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 mr-3">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    KL Laporan Khusus KBM
                  </h3>
                </div>

                <div className="flex-1 space-y-4">
                  {(() => {
                    if (supervisions.length === 0) {
                      return <p className="text-gray-400 italic">Belum ada data untuk menyusun laporan.</p>;
                    }

                    const yearlyData = supervisions.reduce((acc, s) => {
                      const year = s.date ? s.date.substring(0, 4) : 'Unknown';
                      if (!acc[year]) acc[year] = { total: 0, count: 0 };
                      acc[year].total += s.score;
                      acc[year].count += 1;
                      return acc;
                    }, {} as Record<string, { total: number, count: number }>);

                    const years = Object.keys(yearlyData).sort();
                    const latestYear = years[years.length - 1];
                    const prevYear = years[years.length - 2];
                    
                    const latestAvg = (yearlyData[latestYear].total / yearlyData[latestYear].count);
                    const prevAvg = prevYear ? (yearlyData[prevYear].total / yearlyData[prevYear].count) : null;
                    
                    const diff = prevAvg ? (latestAvg - prevAvg) : 0;
                    const status = diff > 0 ? 'Peningkatan' : diff < 0 ? 'Penurunan' : 'Stabil';

                    return (
                      <div className="prose prose-sm text-gray-700 leading-relaxed">
                        <p className="font-medium text-gray-900 border-l-4 border-emerald-400 pl-3 py-1 bg-emerald-50/50 rounded-r-md mb-4">
                          Analisis Kualitas Pengajaran {unitFilter ? `Unit ${unitFilter}` : 'Seluruh Unit'}
                        </p>
                        
                        <ul className="space-y-3 list-none p-0">
                          <li className="flex items-start">
                            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5">1</span>
                            <span>Tercatat <strong>{supervisions.length}</strong> observasi pembelajaran kelas (KBM) yang telah terdokumentasi.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5">2</span>
                            <span>Rata-rata kualitas KBM tahun <strong>{latestYear}</strong> berada pada angka <strong>{latestAvg.toFixed(1)}</strong>.</span>
                          </li>
                          {prevAvg !== null && (
                            <li className="flex items-start">
                              <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5">3</span>
                              <span>Menunjukkan <strong>{status.toLowerCase()}</strong> efektivitas sebesar <strong>{Math.abs(diff).toFixed(1)}</strong> poin dari periode sebelumnya.</span>
                            </li>
                          )}
                          <li className="flex items-start">
                            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5">{prevAvg !== null ? '4' : '3'}</span>
                            <span>Mayoritas tenaga pengajar memperoleh <strong>Grade {stats.A > stats.B ? 'A' : 'B'}</strong> dalam observasi kelas.</span>
                          </li>
                        </ul>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rekomendasi Akademik:</h4>
                          <p className="text-xs italic">
                            "Pertahankan metode pengajaran yang inovatif. Berikan pelatihan tambahan bagi guru dengan skor di bawah rata-rata untuk menjamin standarisasi mutu pembelajaran di seluruh unit."
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between items-center">
                  <span>Laporan KBM Otomatis</span>
                  <span>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSupervision && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-700">Detail Riwayat Supervisi KBM</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <span className="font-semibold text-gray-700">Nama Guru:</span> 
                <span className="ml-2 text-gray-900">{selectedSupervision.teacherName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Jenis Kelamin:</span> 
                <span className="ml-2 text-gray-900">
                  {selectedSupervision.teacherGender === 'male' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Catatan</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supervisions
                    .filter(s => s.teacherId === selectedSupervision.teacherId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((supervision, idx) => (
                    <tr key={supervision.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{supervision.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">{supervision.score}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                          supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                          supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {supervision.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supervision.notes.length > 80 ? (
                          <>
                            {supervision.notes.substring(0, 80)}...
                            <button 
                              onClick={() => handleReadMore(supervision.notes)}
                              className="text-blue-600 hover:text-blue-800 text-xs ml-1 font-medium underline"
                            >
                              Baca selengkapnya
                            </button>
                          </>
                        ) : (
                          supervision.notes
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              handleEdit(supervision);
                              setShowDetailModal(false);
                            }}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Edit"
                            disabled={loading}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(supervision.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Hapus"
                            disabled={loading}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn btn-primary px-8"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read More Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-700">Catatan Lengkap</h3>
              <button 
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-line">{selectedNote}</p>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => setShowNoteModal(false)}
                className="btn btn-primary w-full"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KBMSupervision;
