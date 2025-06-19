import { useState, useEffect } from 'react';
import { 
  Teacher, 
  Supervision,
  getTeachers, 
  saveTeacher, 
  deleteTeacher,
  getAdminSupervisions,
  getKBMSupervisions,
  getClassicSupervisions
} from '../utils/helpers';
import { ArrowUp, Calendar, Check, ChevronLeft, ChevronRight, Download, Eye, Filter, Pencil, Search, Squircle, Trash, User, Users, X } from 'lucide-react';

const TeacherData = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    gender: 'male',
    unit: 'SD',
    className: '',
    subject: '',
    position: ''
  });
  
  // State untuk menyimpan opsi kelas berdasarkan unit
  const [classOptions, setClassOptions] = useState<string[]>([]);
  // State untuk menyimpan kelas yang dipilih (untuk SMP yang bisa memilih lebih dari 1 kelas)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  // State untuk menyimpan keterangan jabatan (untuk Guru Bidang Studi dan Guru Eskul)
  const [positionDetail, setPositionDetail] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [teacherSupervisions, setTeacherSupervisions] = useState<{
    admin: Supervision[];
    kbm: Supervision[];
    classic: Supervision[];
  }>({
    admin: [],
    kbm: [],
    classic: []
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'name',
    direction: 'ascending'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supervisionStatus, setSupervisionStatus] = useState<{
    [teacherId: string]: {
      adm: boolean;
      kbm: boolean;
      klasik: boolean;
    }
  }>({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [genderStats, setGenderStats] = useState({ male: 0, female: 0 });

  useEffect(() => {
    loadTeachers();
  }, [sortConfig, searchTerm, unitFilter]);
  
  // Initialize class options based on default unit when component mounts
  useEffect(() => {
    updateClassOptions(formData.unit || 'SD');
  }, []);

  useEffect(() => {
    loadSupervisionStatus();
  }, [teachers]);

  useEffect(() => {
    // Calculate gender statistics based on current filtered teachers
    const stats = teachers.reduce(
      (acc, teacher) => {
        if (teacher.gender === 'male') {
          acc.male += 1;
        } else {
          acc.female += 1;
        }
        return acc;
      },
      { male: 0, female: 0 }
    );
    setGenderStats(stats);
  }, [teachers]);

  const loadSupervisionStatus = async () => {
    if (!teachers.length) return;
    
    try {
      const adminSupervisions = await getAdminSupervisions();
      const kbmSupervisions = await getKBMSupervisions();
      const classicSupervisions = await getClassicSupervisions();
      
      const status: { [teacherId: string]: { adm: boolean; kbm: boolean; klasik: boolean } } = {};
      
      teachers.forEach(teacher => {
        status[teacher.id] = {
          adm: adminSupervisions.some(s => s.teacherId === teacher.id),
          kbm: kbmSupervisions.some(s => s.teacherId === teacher.id),
          klasik: classicSupervisions.some(s => s.teacherId === teacher.id)
        };
      });
      
      setSupervisionStatus(status);
    } catch (err) {
      console.error('Error loading supervision status:', err);
    }
  };

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      let loadedTeachers = await getTeachers();
      
      // Filter teachers based on search term
      if (searchTerm) {
        loadedTeachers = loadedTeachers.filter(teacher => 
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by unit if selected
      if (unitFilter) {
        loadedTeachers = loadedTeachers.filter(teacher => teacher.unit === unitFilter);
      }
      
      // Check if loadedTeachers is an array before sorting
      if (Array.isArray(loadedTeachers) && loadedTeachers.length > 0) {
        // Sort teachers
        loadedTeachers.sort((a, b) => {
          if (a[sortConfig.key as keyof Teacher] < b[sortConfig.key as keyof Teacher]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key as keyof Teacher] > b[sortConfig.key as keyof Teacher]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setTeachers(loadedTeachers || []);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Failed to load teacher data. Please try again later.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengupdate opsi kelas berdasarkan unit yang dipilih
  const updateClassOptions = (unit: string) => {
    let options: string[] = [];
    
    if (unit === 'RA') {
      options = ['0A1', '0A2', '0B1', '0B2', '0B3', '0B4'];
    } else if (unit === 'SD') {
      // Untuk SD: kelas 1-6 dengan abjad A-E
      for (let grade = 1; grade <= 6; grade++) {
        for (let section of ['A', 'B', 'C', 'D', 'E']) {
          options.push(`${grade}${section}`);
        }
      }
    } else if (unit === 'SMP') {
      // Untuk SMP: kelas 7-9 dengan abjad A-C
      for (let grade = 7; grade <= 9; grade++) {
        for (let section of ['A', 'B', 'C']) {
          options.push(`${grade}${section}`);
        }
      }
    }
    
    setClassOptions(options);
    
    // Reset selected classes when unit changes
    setSelectedClasses([]);
    
    // For non-SMP units, set className to empty
    if (unit !== 'SMP') {
      setFormData(prev => ({ ...prev, className: '' }));
    } else {
      // For SMP, set className to empty string initially
      setFormData(prev => ({ ...prev, className: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unit') {
      // Update class options when unit changes
      updateClassOptions(value);
    }
    
    // Reset positionDetail when position changes to Guru Kelas atau ketika posisi berubah
    if (name === 'position') {
      if (value === 'Guru Kelas') {
        setPositionDetail('');
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle selection of multiple classes for SMP
  const handleClassSelection = (className: string) => {
    if (formData.unit === 'SMP') {
      let updatedClasses: string[];
      
      if (selectedClasses.includes(className)) {
        // Remove class if already selected
        updatedClasses = selectedClasses.filter(c => c !== className);
      } else {
        // Add class if not already selected
        updatedClasses = [...selectedClasses, className];
      }
      
      setSelectedClasses(updatedClasses);
      
      // Update formData.className with comma-separated list of classes
      setFormData(prev => ({ 
        ...prev, 
        className: updatedClasses.join(', ') 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.gender || !formData.unit || !formData.className || !formData.subject || !formData.position) {
      // Pesan khusus untuk kelas yang belum dipilih
      if (!formData.className) {
        if (formData.unit === 'SMP' && selectedClasses.length === 0) {
          alert('Silakan pilih minimal satu kelas');
        } else {
          alert('Silakan pilih kelas');
        }
        return;
      }
      
      alert('Semua field harus diisi');
      return;
    }
    
    // Validasi keterangan untuk Guru Bidang Studi dan Guru Eskul
    if ((formData.position === 'Guru Bidang Studi' || formData.position === 'Guru Eskul') && !positionDetail) {
      alert(`Silakan isi keterangan ${formData.position === 'Guru Bidang Studi' ? 'bidang studi' : 'eskul'}`);
      return;
    }

    setLoading(true);
    try {
      // Gabungkan keterangan jabatan ke dalam posisi jika diperlukan
      let finalPosition = formData.position;
      if ((formData.position === 'Guru Bidang Studi' || formData.position === 'Guru Eskul') && positionDetail) {
        finalPosition = `${formData.position} - ${positionDetail}`;
      }
      
      // Buat objek data guru dengan posisi yang sudah diperbarui
      const teacherData = {
        ...formData,
        position: finalPosition
      };
      
      await saveTeacher(teacherData as Teacher);
      
      const defaultUnit = 'SD';
      setFormData({
        name: '',
        gender: 'male',
        unit: defaultUnit,
        className: '',
        subject: '',
        position: ''
      });
      
      // Reset positionDetail
      setPositionDetail('');
      
      // Reset selected classes and update class options
      setSelectedClasses([]);
      updateClassOptions(defaultUnit);

      setIsEditing(false);
      await loadTeachers();
    } catch (err) {
      console.error('Error saving teacher:', err);
      alert('Failed to save teacher data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    // Ekstrak keterangan jabatan jika ada
    let position = teacher.position;
    let detail = '';
    
    // Cek apakah posisi mengandung keterangan (format: "Guru Bidang Studi - Matematika" atau "Guru Eskul - Pramuka")
    if (position.includes('Guru Bidang Studi - ') || position.includes('Guru Eskul - ')) {
      const parts = position.split(' - ');
      if (parts.length === 2) {
        position = parts[0]; // Ambil jenis jabatan saja
        detail = parts[1];   // Ambil keterangan
      }
    }
    
    // Set form data dengan posisi yang sudah dipisahkan
    setFormData({
      ...teacher,
      position: position
    });
    
    // Set keterangan jabatan
    setPositionDetail(detail);
    
    setIsEditing(true);
    setShowForm(true); // Ensure form is visible when editing
    
    // Update class options based on the teacher's unit
    updateClassOptions(teacher.unit);
    
    // If SMP and has multiple classes, set selectedClasses
    if (teacher.unit === 'SMP' && teacher.className) {
      const classes = teacher.className.split(', ');
      setSelectedClasses(classes);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setLoading(true);
      try {
        await deleteTeacher(id);
        await loadTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        alert('Failed to delete teacher. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDetail = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setLoading(true);
    
    try {
      // Load all supervisions for this teacher
      const adminSupervisions = await getAdminSupervisions();
      const kbmSupervisions = await getKBMSupervisions();
      const classicSupervisions = await getClassicSupervisions();
      
      setTeacherSupervisions({
        admin: adminSupervisions.filter(s => s.teacherId === teacher.id) || [],
        kbm: kbmSupervisions.filter(s => s.teacherId === teacher.id) || [],
        classic: classicSupervisions.filter(s => s.teacherId === teacher.id) || []
      });
      
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error loading supervisions:', err);
      alert('Failed to load supervision data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      gender: 'male',
      unit: 'SD',
      className: '',
      subject: '',
      position: ''
    });
    setIsEditing(false);
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ArrowUp size={16} className="ml-1 inline" /> : 
      <Squircle size={16} className="ml-1 inline" />;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleUnitFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitFilter(e.target.value as 'RA' | 'SD' | 'SMP' | '');
  };

  const handleReadMore = (note: string) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const exportToCSV = async () => {
    try {
      setLoading(true);
      
      // Get all teachers
      const allTeachers = await getTeachers();
      
      // Filter based on current unit filter if applied
      const filteredTeachers = unitFilter 
        ? allTeachers.filter(teacher => teacher.unit === unitFilter)
        : allTeachers;
      
      // Get all supervisions
      const adminSupervisions = await getAdminSupervisions();
      const kbmSupervisions = await getKBMSupervisions();
      const classicSupervisions = await getClassicSupervisions();
      
      // Create CSV header
      let csvContent = "Nama,Unit,Kelas,Mata Pelajaran,Jabatan,Tipe Supervisi,Tanggal,Nilai,Grade,Catatan\n";
      
      // Add data rows
      for (const teacher of filteredTeachers) {
        const adminForTeacher = adminSupervisions.filter(s => s.teacherId === teacher.id);
        const kbmForTeacher = kbmSupervisions.filter(s => s.teacherId === teacher.id);
        const classicForTeacher = classicSupervisions.filter(s => s.teacherId === teacher.id);
        
        // Add admin supervisions
        for (const supervision of adminForTeacher) {
          csvContent += `"${teacher.name}","${teacher.unit}","${teacher.className}","${teacher.subject}","${teacher.position}","Administrasi","${supervision.date}","${supervision.score}","${supervision.grade}","${supervision.notes.replace(/"/g, '""')}"\n`;
        }
        
        // Add KBM supervisions
        for (const supervision of kbmForTeacher) {
          csvContent += `"${teacher.name}","${teacher.unit}","${teacher.className}","${teacher.subject}","${teacher.position}","KBM","${supervision.date}","${supervision.score}","${supervision.grade}","${supervision.notes.replace(/"/g, '""')}"\n`;
        }
        
        // Add classic supervisions
        for (const supervision of classicForTeacher) {
          csvContent += `"${teacher.name}","${teacher.unit}","${teacher.className}","${teacher.subject}","${teacher.position}","Klasik","${supervision.date}","${supervision.score}","${supervision.grade}","${supervision.notes.replace(/"/g, '""')}"\n`;
        }
        
        // If no supervisions, add teacher with empty supervision data
        if (adminForTeacher.length === 0 && kbmForTeacher.length === 0 && classicForTeacher.length === 0) {
          csvContent += `"${teacher.name}","${teacher.unit}","${teacher.className}","${teacher.subject}","${teacher.position}","","","","",""\n`;
        }
      }
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `daftar_guru_supervisi_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSupervisionStatus = (teacherId: string) => {
    const status = supervisionStatus[teacherId];
    if (!status) return null;
    
    return (
      <div className="flex space-x-2">
        <div className="flex items-center">
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded mr-1">ADM</span>
          {status.adm ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-red-600" />
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs font-semibold bg-green-100 text-green-800 px-1.5 py-0.5 rounded mr-1">KBM</span>
          {status.kbm ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-red-600" />
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mr-1">KLASIK</span>
          {status.klasik ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-red-600" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Collapsible Form Section */}
      <div className={`transition-all duration-300 ease-in-out ${showForm ? 'lg:col-span-4' : 'lg:col-span-1'}`}>
        <div className="card relative">
          {/* Toggle button to show/hide form */}
          <div 
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 p-1 rounded-full cursor-pointer shadow-md z-10 hover:bg-blue-700"
            onClick={toggleForm}
          >
            {showForm ? <ChevronLeft size={20} className="text-white" /> : <ChevronRight size={20} className="text-white" />}
          </div>

          {/* Form content - conditionally render based on showForm state */}
          <div className={`${showForm ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              {isEditing ? 'Edit Data Guru' : 'Tambah Data Guru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nama Guru
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama guru"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="form-radio text-blue-600"
                      disabled={loading}
                    />
                    <span className="ml-2">Laki-laki</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="form-radio text-blue-600"
                      disabled={loading}
                    />
                    <span className="ml-2">Perempuan</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="RA">RA</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Kelas
                </label>
                {formData.unit === 'RA' || formData.unit === 'SD' ? (
                  // Dropdown untuk RA dan SD
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Pilih Kelas</option>
                    {classOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Multi-select untuk SMP
                  <div>
                    <div className="mb-2">
                      {formData.className && (
                        <div className="text-sm text-blue-600">
                          Kelas yang dipilih: {formData.className}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {classOptions.map((option) => (
                        <div 
                          key={option} 
                          onClick={() => handleClassSelection(option)}
                          className={`p-2 border rounded cursor-pointer text-center ${selectedClasses.includes(option) 
                            ? 'bg-blue-100 border-blue-500 text-blue-700' 
                            : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan mata pelajaran"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Jabatan
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Pilih Jabatan</option>
                  <option value="Guru Kelas">Guru Kelas</option>
                  <option value="Guru Bidang Studi">Guru Bidang Studi</option>
                  <option value="Guru Eskul">Guru Eskul</option>
                </select>
              </div>
              
              {/* Keterangan tambahan untuk Guru Bidang Studi dan Guru Eskul */}
              {(formData.position === 'Guru Bidang Studi' || formData.position === 'Guru Eskul') && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Keterangan {formData.position === 'Guru Bidang Studi' ? 'Bidang Studi' : 'Eskul'}
                  </label>
                  <input
                    type="text"
                    value={positionDetail}
                    onChange={(e) => setPositionDetail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Masukkan keterangan ${formData.position === 'Guru Bidang Studi' ? 'bidang studi' : 'eskul'}`}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
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
        </div>
      </div>
      
      {/* Teacher Data Section - will expand when form is hidden */}
      <div className={`transition-all duration-300 ease-in-out ${showForm ? 'lg:col-span-8' : 'lg:col-span-11'}`}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-700">Daftar Guru</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md flex items-center"
                title="Export ke CSV"
                disabled={loading}
              >
                <Download size={16} className="mr-1" />
                <span className="text-xs">Export CSV</span>
              </button>
              <div className="flex items-center space-x-2 ml-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Cari nama guru..."
                    className="pl-8 pr-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            </div>
          </div>

          {/* Gender statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Total Guru</h3>
                <p className="text-2xl font-bold mt-1">{teachers.length}</p>
                <p className="text-xs text-blue-100 mt-1">{unitFilter ? `Unit ${unitFilter}` : 'Semua Unit'}</p>
              </div>
              <Users size={32} className="text-blue-200" />
            </div>
            
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Guru Laki-laki</h3>
                <p className="text-2xl font-bold mt-1">{genderStats.male}</p>
                <p className="text-xs text-blue-100 mt-1">{(genderStats.male / teachers.length * 100 || 0).toFixed(1)}% dari total</p>
              </div>
              <User size={32} className="text-blue-200" />
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-white shadow flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Guru Perempuan</h3>
                <p className="text-2xl font-bold mt-1">{genderStats.female}</p>
                <p className="text-xs text-purple-100 mt-1">{(genderStats.female / teachers.length * 100 || 0).toFixed(1)}% dari total</p>
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
          ) : teachers.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada data guru</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[550px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50 sticky top-0 z-10">
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Supervisi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher, index) => (
                      <tr key={teacher.id} className="hover:bg-blue-50">
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
                        <td className="px-4 py-4">
                          {renderSupervisionStatus(teacher.id)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
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
                              onClick={() => handleEdit(teacher)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                              disabled={loading}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(teacher.id)}
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
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTeacher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-700">Detail Guru</h3>
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
            
            {/* Supervision History Tabs */}
            <div className="mt-4">
              <h4 className="text-md font-semibold text-blue-700 mb-3 flex items-center">
                <Calendar size={18} className="mr-2" />
                Riwayat Supervisi
              </h4>
              
              <div className="border rounded-lg overflow-hidden">
                {/* Admin Supervisions */}
                <div className="border-b">
                  <div className="bg-blue-100 px-4 py-2">
                    <h5 className="font-medium">Supervisi Administrasi</h5>
                  </div>
                  {teacherSupervisions.admin.length === 0 ? (
                    <p className="px-4 py-2 text-gray-500 italic text-sm">Belum ada data supervisi</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teacherSupervisions.admin.map((supervision, index) => (
                            <tr key={supervision.id}>
                              <td className="px-2 py-2 whitespace-nowrap text-sm">{index + 1}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.score}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                                  supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                                  supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {supervision.grade}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {supervision.notes.length > 50 ? (
                                  <div>
                                    {supervision.notes.substring(0, 50)}...
                                    <button 
                                      onClick={() => handleReadMore(supervision.notes)}
                                      className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                                    >
                                      Baca selengkapnya
                                    </button>
                                  </div>
                                ) : (
                                  <div>{supervision.notes}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* KBM Supervisions */}
                <div className="border-b">
                  <div className="bg-green-100 px-4 py-2">
                    <h5 className="font-medium">Supervisi KBM</h5>
                  </div>
                  {teacherSupervisions.kbm.length === 0 ? (
                    <p className="px-4 py-2 text-gray-500 italic text-sm">Belum ada data supervisi</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teacherSupervisions.kbm.map((supervision, index) => (
                            <tr key={supervision.id}>
                              <td className="px-2 py-2 whitespace-nowrap text-sm">{index + 1}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.score}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                                  supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                                  supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {supervision.grade}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {supervision.notes.length > 50 ? (
                                  <div>
                                    {supervision.notes.substring(0, 50)}...
                                    <button 
                                      onClick={() => handleReadMore(supervision.notes)}
                                      className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                                    >
                                      Baca selengkapnya
                                    </button>
                                  </div>
                                ) : (
                                  <div>{supervision.notes}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Classic Supervisions */}
                <div>
                  <div className="bg-yellow-100 px-4 py-2">
                    <h5 className="font-medium">Supervisi Klasik</h5>
                  </div>
                  {teacherSupervisions.classic.length === 0 ? (
                    <p className="px-4 py-2 text-gray-500 italic text-sm">Belum ada data supervisi</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teacherSupervisions.classic.map((supervision, index) => (
                            <tr key={supervision.id}>
                              <td className="px-2 py-2 whitespace-nowrap text-sm">{index + 1}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{supervision.score}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  supervision.grade === 'A' ? 'bg-green-100 text-green-800' : 
                                  supervision.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                                  supervision.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {supervision.grade}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {supervision.notes.length > 50 ? (
                                  <div>
                                    {supervision.notes.substring(0, 50)}...
                                    <button 
                                      onClick={() => handleReadMore(supervision.notes)}
                                      className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                                    >
                                      Baca selengkapnya
                                    </button>
                                  </div>
                                ) : (
                                  <div>{supervision.notes}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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

export default TeacherData;
