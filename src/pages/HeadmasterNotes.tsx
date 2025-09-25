import { useState, useEffect } from 'react';
import { 
  Teacher, 
  HeadmasterNote,
  getTeachers,
  getHeadmasterNotes,
  saveHeadmasterNote,
  deleteHeadmasterNote
} from '../utils/helpers';
import { Search, User, Save, Edit, Trash, History } from 'lucide-react';
import { useAuth } from '../utils/authContext';

const HeadmasterNotes = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<HeadmasterNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<HeadmasterNote[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | 'all'>('all');
  const [showNoteHistory, setShowNoteHistory] = useState(false);
  const [selectedTeacherNotes, setSelectedTeacherNotes] = useState<HeadmasterNote[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Categories for notes
  const caseCategories = [
    'Disiplin Kehadiran',
    'Etika & Perilaku',
    'Kinerja Mengajar',
    'Administrasi & Tugas Tambahan',
    'Pelanggaran Aturan Sekolah/Etika Profesi'
  ];

  const achievementCategories = [
    'Kehadiran & Disiplin',
    'Kinerja Mengajar',
    'Pengembangan Diri',
    'Kontribusi di Luar Kelas',
    'Etika & Keteladanan',
    'Penghargaan Eksternal'
  ];

  useEffect(() => {
    loadTeachers();
    loadNotes();
  }, []);

  useEffect(() => {
    // Filter teachers based on search term and unit filter
    let filtered = [...teachers];
    
    // Apply unit filter
    if (unitFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.unit === unitFilter);
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.unit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers, unitFilter]);

  useEffect(() => {
    // Filter notes based on unit filter
    let filtered = [...notes];
    
    if (unitFilter !== 'all') {
      filtered = filtered.filter(note => {
        const teacher = teachers.find(t => t.id === note.teacherId);
        return teacher && teacher.unit === unitFilter;
      });
    }
    
    setFilteredNotes(filtered);
  }, [notes, unitFilter, teachers]);

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTeachers = await getTeachers();
      setTeachers(loadedTeachers || []);
      setFilteredTeachers(loadedTeachers || []);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Failed to load teacher data. Please try again later.');
      setTeachers([]);
      setFilteredTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const loadedNotes = await getHeadmasterNotes();
      
      // Filter out notes without valid IDs
      const validNotes = loadedNotes.filter(note => 
        note.id && 
        typeof note.id === 'string' && 
        note.id.trim() !== ''
      );
      
      // Debug: Log the loaded notes and their IDs
      console.log('Loaded notes:', validNotes);
      if (validNotes.length > 0) {
        console.log('First note ID:', validNotes[0].id);
        console.log('First note ID type:', typeof validNotes[0].id);
      }
      
      setNotes(validNotes || []);
      setFilteredNotes(validNotes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
      // We won't show an error here as it's not critical
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    // Reset form when selecting a new teacher
    setSelectedCategories([]);
    setNoteText('');
    setEditingNoteId(null);
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSaveNote = async () => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyimpan catatan.');
      return;
    }
    
    if (!selectedTeacher) {
      alert('Silakan pilih guru terlebih dahulu');
      return;
    }
  
    if (selectedCategories.length === 0) {
      alert('Silakan pilih minimal satu kategori');
      return;
    }
  
    if (!noteText.trim()) {
      alert('Silakan isi catatan');
      return;
    }
  
    setLoading(true);
    try {
      // Untuk catatan baru, jangan set ID sama sekali
      // Firebase akan membuatkan ID otomatis
      const noteData = {
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        date: new Date().toISOString().split('T')[0],
        categories: [...selectedCategories],
        note: noteText.trim()
      };
  
      // Jika editing catatan lama, gunakan ID yang ada
      if (editingNoteId && editingNoteId.trim() !== '') {
        await saveHeadmasterNote({
          ...noteData,
          id: editingNoteId
        });
      } else {
        // Untuk catatan baru, kirim tanpa ID
        await saveHeadmasterNote(noteData as HeadmasterNote);
      }
  
      // Refresh notes list
      await loadNotes();
  
      // Reset form
      setSelectedCategories([]);
      setNoteText('');
      setEditingNoteId(null);
      
      // Show success modal
      setSuccessMessage(editingNoteId ? 'Catatan berhasil diperbarui!' : 'Catatan berhasil disimpan!');
      setShowSuccessModal(true);
      
      // Hide success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Gagal menyimpan catatan. Silakan coba lagi.');
      
      // Show error in alert for now, but we could also create an error modal
      alert('Gagal menyimpan catatan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note: HeadmasterNote) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat mengedit catatan.');
      return;
    }
    
    // Validate note ID
    if (!note.id || note.id.trim() === '') {
      alert('Catatan tidak valid untuk diedit.');
      return;
    }
    
    setSelectedTeacher(teachers.find(t => t.id === note.teacherId) || null);
    setSelectedCategories([...note.categories]);
    setNoteText(note.note);
    setEditingNoteId(note.id);
  };

  const handleDeleteNote = async (id: string) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menghapus catatan.');
      return;
    }
    
    // Validate ID before proceeding
    if (!id || typeof id !== 'string' || id.trim() === '') {
      alert('ID catatan tidak valid.');
      return;
    }
    
    // Show confirmation modal instead of browser confirm
    setConfirmMessage('Apakah Anda yakin ingin menghapus catatan ini?');
    setConfirmAction(() => async () => {
      setLoading(true);
      try {
        await deleteHeadmasterNote(id);
        // Refresh notes list
        await loadNotes();
        if (editingNoteId === id) {
          setSelectedCategories([]);
          setNoteText('');
          setEditingNoteId(null);
        }
        
        // Show success modal
        setSuccessMessage('Catatan berhasil dihapus!');
        setShowSuccessModal(true);
        
        // Hide success modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } catch (err) {
        console.error('Error deleting note:', err);
        alert('Gagal menghapus catatan. Silakan coba lagi.');
      } finally {
        setLoading(false);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Function to show note history for a teacher
  const showNoteHistoryForTeacher = (teacher: Teacher) => {
    // Filter notes for this teacher and ensure they have valid IDs
    const teacherNotes = notes.filter(note => 
      note.teacherId === teacher.id && 
      note.id && 
      typeof note.id === 'string' && 
      note.id.trim() !== ''
    );
    
    // Debug: Log the teacher notes and their IDs
    console.log('Showing history for teacher:', teacher.name);
    console.log('Teacher ID:', teacher.id);
    console.log('Found notes for teacher:', teacherNotes);
    if (teacherNotes.length > 0) {
      console.log('First note ID:', teacherNotes[0].id);
      console.log('First note ID type:', typeof teacherNotes[0].id);
    }
    
    setSelectedTeacherNotes(teacherNotes);
    setShowNoteHistory(true);
  };

  // Function to get case count for a teacher
  const getCaseCountForTeacher = (teacherId: string) => {
    return notes.filter(note => note.teacherId === teacherId).length;
  };

  // Function to delete a note from the history modal
  const handleDeleteNoteFromHistory = async (id: string) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menghapus catatan.');
      return;
    }
    
    // Comprehensive debugging
    console.log('=== DELETE DEBUG INFO ===');
    console.log('Note ID received:', id);
    console.log('Type of ID:', typeof id);
    console.log('ID length:', id ? id.length : 0);
    console.log('ID trimmed:', id ? id.trim() : 'null');
    console.log('ID is empty string:', id === '');
    console.log('ID is undefined string:', id === 'undefined');
    console.log('ID is null string:', id === 'null');
    
    // Validate ID before proceeding - comprehensive validation
    if (!id) {
      console.error('ID is falsy:', id);
      alert('ID catatan tidak valid - ID is missing.');
      return;
    }
    
    if (typeof id !== 'string') {
      console.error('ID is not a string:', typeof id, id);
      alert('ID catatan tidak valid - ID is not a string.');
      return;
    }
    
    const trimmedId = id.trim();
    if (trimmedId === '') {
      console.error('ID is empty after trimming:', id);
      alert('ID catatan tidak valid - ID is empty.');
      return;
    }
    
    if (trimmedId === 'undefined') {
      console.error('ID is literally "undefined":', id);
      alert('ID catatan tidak valid - ID is undefined.');
      return;
    }
    
    if (trimmedId === 'null') {
      console.error('ID is literally "null":', id);
      alert('ID catatan tidak valid - ID is null.');
      return;
    }
    
    // Show confirmation modal instead of browser confirm
    setConfirmMessage('Apakah Anda yakin ingin menghapus catatan ini?');
    setConfirmAction(() => async () => {
      setLoading(true);
      try {
        console.log('Attempting to delete note with ID:', trimmedId);
        await deleteHeadmasterNote(trimmedId);
        console.log('Successfully deleted note with ID:', trimmedId);
        
        // Update the selected teacher notes if the modal is open
        if (showNoteHistory && selectedTeacherNotes.length > 0) {
          const updatedNotes = selectedTeacherNotes.filter(note => note.id !== trimmedId);
          setSelectedTeacherNotes(updatedNotes);
        }
        
        // Also update the main notes list
        const updatedNotes = notes.filter(note => note.id !== trimmedId);
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes);
        
        // Refresh all notes to ensure consistency
        await loadNotes();
        
        // Show success modal
        setSuccessMessage('Catatan berhasil dihapus!');
        setShowSuccessModal(true);
        
        // Hide success modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } catch (err) {
        console.error('Error deleting note with ID:', trimmedId, err);
        alert('Gagal menghapus catatan. Silakan coba lagi.');
      } finally {
        setLoading(false);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Teacher Selection Panel */}
      <div className="lg:col-span-1">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Pilih Guru</h2>
          
          {/* Unit Filter Tabs */}
          <div className="flex mb-4 border-b">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                unitFilter === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setUnitFilter('all')}
            >
              Semua
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                unitFilter === 'RA'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setUnitFilter('RA')}
            >
              RA
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                unitFilter === 'SD'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setUnitFilter('SD')}
            >
              SD
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                unitFilter === 'SMP'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setUnitFilter('SMP')}
            >
              SMP
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru..."
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !isAdmin}
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          {/* Teacher List */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : filteredTeachers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada guru yang ditemukan</p>
            ) : (
              <div className="space-y-2">
                {filteredTeachers.map(teacher => (
                  <div 
                    key={teacher.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-blue-50 ${
                      selectedTeacher?.id === teacher.id ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
                    } ${!isAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={() => isAdmin && handleTeacherSelect(teacher)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-600">{teacher.subject} - {teacher.unit}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Case count indicator */}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getCaseCountForTeacher(teacher.id) >= 5 ? 'bg-red-500 text-white' :
                          getCaseCountForTeacher(teacher.id) >= 3 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {getCaseCountForTeacher(teacher.id)}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            showNoteHistoryForTeacher(teacher);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Lihat Riwayat Catatan"
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Note Form and List Panel */}
      <div className="lg:col-span-2">
        {/* Note Form */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            {selectedTeacher ? `Catatan untuk ${selectedTeacher.name}` : 'Catatan KS'}
          </h2>
          
          {!isAdmin && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-700">
                Anda masuk sebagai Tamu. Hanya admin yang dapat menambah, mengedit, atau menghapus catatan.
              </p>
            </div>
          )}
          
          {selectedTeacher ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="font-medium">{selectedTeacher.name}</div>
                <div className="text-sm text-gray-600">
                  {selectedTeacher.subject} - {selectedTeacher.unit} - {selectedTeacher.position}
                </div>
              </div>
              
              {/* Categories Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Kategori Catatan
                </label>
                
                {/* Case Categories */}
                <div className="mb-3">
                  <h3 className="font-medium text-gray-800 mb-2">Catatan Kasus</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {caseCategories.map(category => (
                      <div 
                        key={category}
                        className={`p-2 border rounded cursor-pointer ${
                          selectedCategories.includes(category) 
                            ? 'bg-red-100 border-red-500' 
                            : 'border-gray-300 hover:bg-gray-50'
                        } ${!isAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={() => isAdmin && handleCategoryToggle(category)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => {}}
                            className="mr-2"
                            disabled={loading || !isAdmin}
                          />
                          <span className="text-sm">{category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Achievement Categories */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Catatan Prestasi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {achievementCategories.map(category => (
                      <div 
                        key={category}
                        className={`p-2 border rounded cursor-pointer ${
                          selectedCategories.includes(category) 
                            ? 'bg-green-100 border-green-500' 
                            : 'border-gray-300 hover:bg-gray-50'
                        } ${!isAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={() => isAdmin && handleCategoryToggle(category)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => {}}
                            className="mr-2"
                            disabled={loading || !isAdmin}
                          />
                          <span className="text-sm">{category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Note Text */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Catatan
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => isAdmin && setNoteText(e.target.value)}
                  placeholder="Tulis catatan Anda di sini..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || !isAdmin}
                />
              </div>
              
              {/* Save Button */}
              {isAdmin && (
                <button
                  onClick={handleSaveNote}
                  className="btn btn-primary flex items-center"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Menyimpan...' : editingNoteId ? 'Update Catatan' : 'Simpan Catatan'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Silakan pilih guru terlebih dahulu untuk menambahkan catatan</p>
            </div>
          )}
        </div>
        
        {/* Notes List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-700">Catatan Terkini</h2>
            
            {/* Unit Filter Tabs for Notes */}
            <div className="flex border rounded-md">
              <button
                className={`py-1 px-3 text-sm ${
                  unitFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setUnitFilter('all')}
              >
                Semua
              </button>
              <button
                className={`py-1 px-3 text-sm border-l ${
                  unitFilter === 'RA'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setUnitFilter('RA')}
              >
                RA
              </button>
              <button
                className={`py-1 px-3 text-sm border-l ${
                  unitFilter === 'SD'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setUnitFilter('SD')}
              >
                SD
              </button>
              <button
                className={`py-1 px-3 text-sm border-l ${
                  unitFilter === 'SMP'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setUnitFilter('SMP')}
              >
                SMP
              </button>
            </div>
          </div>
          
          {filteredNotes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada catatan</p>
          ) : (
            <div className="space-y-4">
              {[...filteredNotes]
                .filter(note => note.id && note.id.trim() !== '') // Only show notes with valid IDs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(note => (
                  <div key={note.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{note.teacherName}</div>
                        <div className="text-sm text-gray-600">{note.date}</div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => note.id && handleEditNote(note)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                            disabled={loading || !note.id}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                            disabled={loading || !note.id}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.categories.map(category => (
                          <span 
                            key={category} 
                            className={`px-2 py-1 rounded text-xs ${
                              caseCategories.includes(category) 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-700 whitespace-pre-line">{note.note}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full transform transition-all duration-300 scale-95 animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Berhasil!
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full transform transition-all duration-300 scale-95 animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Konfirmasi
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {confirmMessage}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm"
                onClick={() => {
                  if (confirmAction) {
                    confirmAction();
                  }
                }}
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Note History Modal */}
      {showNoteHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-700">
                Riwayat Catatan untuk {selectedTeacherNotes[0]?.teacherName || 'Guru'}
              </h3>
              <button 
                onClick={() => setShowNoteHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedTeacherNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada catatan untuk guru ini</p>
            ) : (
              <div className="space-y-4">
                {[...selectedTeacherNotes]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(note => (
                    <div key={note.id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{note.teacherName}</div>
                          <div className="text-sm text-gray-600">{note.date}</div>
                          {/* Debug: Show note ID for troubleshooting */}
                          <div className="text-xs text-gray-500">ID: {note.id} ({typeof note.id})</div>
                        </div>
                        {isAdmin && note.id && typeof note.id === 'string' && note.id.trim() !== '' && (
                          <button 
                            onClick={() => {
                              console.log('Delete button clicked for note ID:', note.id);
                              handleDeleteNoteFromHistory(note.id);
                            }}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus Catatan"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.categories.map(category => (
                            <span 
                              key={category} 
                              className={`px-2 py-1 rounded text-xs ${
                                caseCategories.includes(category) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-700 whitespace-pre-line">{note.note}</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            
            <div className="mt-6">
              <button 
                onClick={() => setShowNoteHistory(false)}
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

export default HeadmasterNotes;