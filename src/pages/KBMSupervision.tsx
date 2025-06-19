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
import { Eye, Filter, Pencil, Search, Trash, X } from 'lucide-react';

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
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedTeacherGender, setSelectedTeacherGender] = useState<'male' | 'female' | ''>('');

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
      
      // Enrich supervisions with teacher gender
      const enrichedSupervisions = loadedSupervisions.map(supervision => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          {isEditing ? 'Edit Supervisi KBM' : 'Tambah Supervisi KBM'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Catatan
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan catatan"
              disabled={loading}
            ></textarea>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : isEditing ? 'Update' : 'Simpan'}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-700">Daftar Supervisi KBM</h2>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-blue-600" />
            <select
              value={unitFilter}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Semua Unit</option>
              <option value="RA">RA</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : supervisions.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada data supervisi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supervisions.map((supervision, index) => (
                  <tr key={supervision.id} className="hover:bg-blue-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{supervision.teacherName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      {supervision.teacherGender === 'male' ? 'L' : 'P'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{supervision.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{supervision.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                        supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                        supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {supervision.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDetail(supervision)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Detail"
                          disabled={loading}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(supervision)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                          disabled={loading}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(supervision.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                          disabled={loading}
                        >
                          <Trash size={18} />
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
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-700">Detail Supervisi KBM</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Nama Guru:</span> {selectedSupervision.teacherName}
              </div>
              <div>
                <span className="font-medium">Jenis Kelamin:</span> {selectedSupervision.teacherGender === 'male' ? 'Laki-laki (L)' : 'Perempuan (P)'}
              </div>
              <div>
                <span className="font-medium">Tanggal Supervisi:</span> {selectedSupervision.date}
              </div>
              <div>
                <span className="font-medium">Nilai:</span> {selectedSupervision.score}
              </div>
              <div>
                <span className="font-medium">Grade:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedSupervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                  selectedSupervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                  selectedSupervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedSupervision.grade}
                </span>
              </div>
              <div>
                <span className="font-medium">Catatan:</span>
                <p className="mt-1 text-gray-700">
                  {selectedSupervision.notes.length > 100 
                    ? (
                      <>
                        {selectedSupervision.notes.substring(0, 100)}... 
                        <button 
                          onClick={() => handleReadMore(selectedSupervision.notes)}
                          className="text-blue-600 hover:text-blue-800 text-sm ml-1"
                        >
                          Baca selengkapnya
                        </button>
                      </>
                    ) 
                    : selectedSupervision.notes
                  }
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn btn-primary w-full"
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
