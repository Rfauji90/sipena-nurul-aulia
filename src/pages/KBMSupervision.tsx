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
import { Eye, Filter, Pencil, Search, Trash, X, Download, BookOpen, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateSupervisionPDF } from '../utils/exportUtils';

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
  const [yearFilter, setYearFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    yearFilter === '' || (s.date && s.date.startsWith(yearFilter))
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
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BookOpen className="mr-2 text-blue-600" />
          Supervisi KBM
        </h1>
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
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
              Tambah Supervisi KBM
            </>
          )}
        </button>
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
      
      {/* Cards Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500 mb-1">Grade A</span>
          <span className="text-3xl font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg">{stats.A}</span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500 mb-1">Grade B</span>
          <span className="text-3xl font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">{stats.B}</span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500 mb-1">Grade C</span>
          <span className="text-3xl font-bold text-yellow-600 px-3 py-1 bg-yellow-50 rounded-lg">{stats.C}</span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500 mb-1">Grade D</span>
          <span className="text-3xl font-bold text-red-600 px-3 py-1 bg-red-50 rounded-lg">{stats.D}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-blue-700">Daftar Supervisi KBM</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-blue-600" />
              <select
                value={unitFilter}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Semua Unit</option>
                <option value="RA">RA</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
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
