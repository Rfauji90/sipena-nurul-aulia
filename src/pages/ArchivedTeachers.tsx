import { useState, useEffect } from 'react';
import { 
  Teacher, 
  getArchivedTeachers, 
  unarchiveTeacher,
  deleteTeacher
} from '../utils/helpers';
import { useAuth } from '../utils/authContext';
import { 
  User, 
  Eye, 
  RotateCcw, 
  Trash, 
  Search, 
  Filter,
  Download,
  X,
  Archive
} from 'lucide-react';

const ArchivedTeachers = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Teacher;
    direction: 'ascending' | 'descending';
  }>({
    key: 'archivedDate',
    direction: 'descending'
  });

  useEffect(() => {
    loadArchivedTeachers();
  }, []);

  const loadArchivedTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const archivedTeachers = await getArchivedTeachers();
      setTeachers(archivedTeachers || []);
    } catch (err) {
      console.error('Error loading archived teachers:', err);
      setError('Failed to load archived teacher data. Please try again later.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan guru ini ke data aktif?')) {
      return;
    }

    try {
      setLoading(true);
      await unarchiveTeacher(id);
      await loadArchivedTeachers(); // Reload data
      alert('Guru berhasil dikembalikan ke data aktif!');
    } catch (error) {
      console.error('Error unarchiving teacher:', error);
      alert('Gagal mengembalikan guru. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus guru ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTeacher(id);
      await loadArchivedTeachers(); // Reload data
      alert('Guru berhasil dihapus secara permanen!');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Gagal menghapus guru. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleSort = (key: keyof Teacher) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof Teacher) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUnitFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitFilter(e.target.value as 'RA' | 'SD' | 'SMP' | '');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['No', 'Nama', 'Jenis Kelamin', 'Unit', 'Kelas', 'Mata Pelajaran', 'Jabatan', 'Tanggal Diarsipkan'],
      ...filteredAndSortedTeachers.map((teacher, index) => [
        index + 1,
        teacher.name,
        teacher.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        teacher.unit,
        teacher.className,
        teacher.subject,
        teacher.position,
        teacher.archivedDate || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `arsip_guru_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort teachers
  const filteredAndSortedTeachers = teachers
    .filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.unit.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = !unitFilter || teacher.unit === unitFilter;
      return matchesSearch && matchesUnit;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Teacher];
      const bValue = b[sortConfig.key as keyof Teacher];
      
      if (aValue == null || bValue == null) return 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const genderStats = {
    male: filteredAndSortedTeachers.filter(t => t.gender === 'male').length,
    female: filteredAndSortedTeachers.filter(t => t.gender === 'female').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Archive size={24} className="text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Arsip Guru</h1>
          </div>
          <p className="text-gray-600">Data guru yang telah diarsipkan (keluar/pensiun)</p>
        </div>

        {!isAdmin && (
          <div className="mb-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              Anda masuk sebagai Tamu. Hanya dapat melihat data tanpa akses untuk mengembalikan atau menghapus.
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Daftar Guru Diarsipkan</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                disabled={loading}
              >
                <Download size={16} className="mr-1" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Cari nama, mata pelajaran, jabatan, atau unit..."
                  className="pl-8 pr-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  disabled={loading}
                />
                <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
              </div>
              <div className="flex items-center">
                <Filter size={16} className="text-blue-600 mr-1" />
                <select
                  value={unitFilter}
                  onChange={handleUnitFilterChange}
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
            
            {/* Search Results Info */}
            {(searchTerm || unitFilter) && (
              <div className="mt-2 text-sm text-gray-600">
                {searchTerm && (
                  <span>
                    Hasil pencarian untuk "<strong>{searchTerm}</strong>"
                    {unitFilter && ` di unit ${unitFilter}`}: {filteredAndSortedTeachers.length} guru ditemukan
                  </span>
                )}
                {!searchTerm && unitFilter && (
                  <span>Filter unit {unitFilter}: {filteredAndSortedTeachers.length} guru ditemukan</span>
                )}
                {filteredAndSortedTeachers.length === 0 && (
                  <span className="text-orange-600"> - Tidak ada data yang sesuai</span>
                )}
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Total Guru Diarsipkan</h3>
                <p className="text-2xl font-bold mt-1">{filteredAndSortedTeachers.length}</p>
                <p className="text-xs text-gray-100 mt-1">{unitFilter ? `Unit ${unitFilter}` : 'Semua Unit'}</p>
              </div>
              <Archive size={32} className="text-gray-200" />
            </div>
            
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Guru Laki-laki</h3>
                <p className="text-2xl font-bold mt-1">{genderStats.male}</p>
                <p className="text-xs text-gray-100 mt-1">{(genderStats.male / filteredAndSortedTeachers.length * 100 || 0).toFixed(1)}% dari total</p>
              </div>
              <User size={32} className="text-gray-200" />
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Guru Perempuan</h3>
                <p className="text-2xl font-bold mt-1">{genderStats.female}</p>
                <p className="text-xs text-purple-100 mt-1">{(genderStats.female / filteredAndSortedTeachers.length * 100 || 0).toFixed(1)}% dari total</p>
              </div>
              <User size={32} className="text-purple-200" />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredAndSortedTeachers.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada guru yang diarsipkan</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[550px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-48"
                        onClick={() => handleSort('name')}
                      >
                        Nama {getSortIcon('name')}
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        JK
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('unit')}
                      >
                        Unit {getSortIcon('unit')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-36"
                        onClick={() => handleSort('className')}
                      >
                        Kelas {getSortIcon('className')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-40"
                        onClick={() => handleSort('position')}
                      >
                        Jabatan {getSortIcon('position')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('archivedDate')}
                      >
                        Tanggal Diarsipkan {getSortIcon('archivedDate')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTeachers.map((teacher, index) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{index + 1}</td>
                        <td className="px-4 py-4 text-sm text-gray-700 w-48">
                          <div className="truncate max-w-[180px]" title={teacher.name}>
                            {teacher.name}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-medium">
                          {teacher.gender === 'male' ? 'L' : 'P'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{teacher.unit}</td>
                        <td className="px-4 py-4 text-sm text-gray-700 w-36">
                          <div className="truncate max-w-[120px]" title={teacher.className}>
                            {teacher.className}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 w-40">
                          <div className="truncate max-w-[140px]" title={teacher.position}>
                            {teacher.position}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {teacher.archivedDate || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isAdmin ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDetail(teacher)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Detail"
                                disabled={loading}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleUnarchive(teacher.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Kembalikan ke Data Aktif"
                                disabled={loading}
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(teacher.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus Permanen"
                                disabled={loading}
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDetail(teacher)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Detail"
                                disabled={loading}
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Detail Guru Diarsipkan</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Nama:</span> {selectedTeacher.name}
                </div>
                <div>
                  <span className="font-medium">Jenis Kelamin:</span> {selectedTeacher.gender === 'male' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </div>
                <div>
                  <span className="font-medium">Unit:</span> {selectedTeacher.unit}
                </div>
                <div>
                  <span className="font-medium">Tanggal Diarsipkan:</span> {selectedTeacher.archivedDate || '-'}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Kelas:</span> {selectedTeacher.className}
                </div>
                <div>
                  <span className="font-medium">Mata Pelajaran:</span> {selectedTeacher.subject}
                </div>
                <div>
                  <span className="font-medium">Jabatan:</span> {selectedTeacher.position}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleUnarchive(selectedTeacher.id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <RotateCcw size={16} className="inline mr-1" />
                    Kembalikan ke Data Aktif
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDelete(selectedTeacher.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash size={16} className="inline mr-1" />
                    Hapus Permanen
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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

export default ArchivedTeachers;