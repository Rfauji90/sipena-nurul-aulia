import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import { 
  getTeachers,
  getAdminSupervisions,
  getKBMSupervisions,
  getClassicSupervisions,
  Teacher
} from '../utils/helpers';
import { 
  Filter, 
  AlertTriangle, 
  UserX, 
  TrendingDown, 
  CheckCircle, 
  BarChart3, 
  BookOpen, 
  Award,
  Activity,
  Info,
  Calendar
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeacherSummary {
  teacher: Teacher;
  latestGrade: string;
  latestScore: number;
  latestDate: string;
  type: string;
  totalSupervisions: number;
}

const Dashboard = () => {
  const [teacherCount, setTeacherCount] = useState(0);
  const [adminSupervisionCount, setAdminSupervisionCount] = useState(0);
  const [kbmSupervisionCount, setKbmSupervisionCount] = useState(0);
  const [classicSupervisionCount, setClassicSupervisionCount] = useState(0);
  const [gradeData, setGradeData] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [teachersByUnit, setTeachersByUnit] = useState({ RA: 0, SD: 0, SMP: 0 });
  const [loading, setLoading] = useState(false);
  const [performanceGrowthData, setPerformanceGrowthData] = useState<any>(null);

  // Summary states
  const [lowGradeTeachers, setLowGradeTeachers] = useState<TeacherSummary[]>([]);
  const [neverSupervisedTeachers, setNeverSupervisedTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    loadData();
  }, [unitFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load teachers by unit
      const teachers = await getTeachers();
      const byUnit = { RA: 0, SD: 0, SMP: 0 };
      teachers.forEach(teacher => {
        byUnit[teacher.unit]++;
      });
      setTeachersByUnit(byUnit);

      // Filter based on unit selection
      const filteredTeachers = unitFilter 
        ? teachers.filter(teacher => teacher.unit === unitFilter)
        : teachers;
      
      const adminSupervisions = await getAdminSupervisions(unitFilter as 'RA' | 'SD' | 'SMP' | undefined);
      const kbmSupervisions = await getKBMSupervisions(unitFilter as 'RA' | 'SD' | 'SMP' | undefined);
      const classicSupervisions = await getClassicSupervisions(unitFilter as 'RA' | 'SD' | 'SMP' | undefined);

      // Set counts
      setTeacherCount(filteredTeachers.length);
      setAdminSupervisionCount(adminSupervisions.length);
      setKbmSupervisionCount(kbmSupervisions.length);
      setClassicSupervisionCount(classicSupervisions.length);

      // Filter supervisions by type if selected
      let filteredAdmin = adminSupervisions;
      let filteredKBM = kbmSupervisions;
      let filteredClassic = classicSupervisions;

      if (typeFilter === 'ADM') {
        filteredKBM = [];
        filteredClassic = [];
      } else if (typeFilter === 'KBM') {
        filteredAdmin = [];
        filteredClassic = [];
      } else if (typeFilter === 'Klasik') {
        filteredAdmin = [];
        filteredKBM = [];
      }

      // Calculate grade distribution based on type filter
      const allSupervisions = [
        ...filteredAdmin, 
        ...filteredKBM, 
        ...filteredClassic
      ];
      
      const grades = { A: 0, B: 0, C: 0, D: 0 };
      allSupervisions.forEach(supervision => {
        if (supervision.grade) {
          grades[supervision.grade as keyof typeof grades]++;
        }
      });
      
      setGradeData(grades);

      // ===== PERFORMANCE GROWTH DATA (Academic Year) =====
      const getAcademicYear = (dateStr: string) => {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-indexed
        if (month >= 7) {
          return `${year}-${year + 1}`;
        } else {
          return `${year - 1}-${year}`;
        }
      };

      const yearlyPerformance: Record<string, { A: number, B: number, C: number, D: number }> = {};
      
      allSupervisions.forEach(s => {
        const academicYear = getAcademicYear(s.date);
        if (!yearlyPerformance[academicYear]) {
          yearlyPerformance[academicYear] = { A: 0, B: 0, C: 0, D: 0 };
        }
        if (s.grade && yearlyPerformance[academicYear][s.grade as 'A' | 'B' | 'C' | 'D'] !== undefined) {
          yearlyPerformance[academicYear][s.grade as 'A' | 'B' | 'C' | 'D']++;
        }
      });

      // Sort academic years
      const academicYears = Object.keys(yearlyPerformance).sort();
      
      setPerformanceGrowthData({
        labels: academicYears,
        datasets: [
          {
            label: 'Grade A',
            data: academicYears.map(year => yearlyPerformance[year].A),
            backgroundColor: '#3b82f6', // Biru terang seperti di gambar
            borderRadius: 4,
          },
          {
            label: 'Grade B',
            data: academicYears.map(year => yearlyPerformance[year].B),
            backgroundColor: '#ef4444', // Merah seperti di gambar
            borderRadius: 4,
          },
          {
            label: 'Grade C',
            data: academicYears.map(year => yearlyPerformance[year].C),
            backgroundColor: '#f59e0b', // Kuning/Oranye seperti di gambar
            borderRadius: 4,
          }
        ]
      });

      // ===== SUMMARY: Low grade teachers (C or D) =====
      const enrichedWithType = [
        ...adminSupervisions.map(s => ({ ...s, supervisionType: 'ADM' })),
        ...kbmSupervisions.map(s => ({ ...s, supervisionType: 'KBM' })),
        ...classicSupervisions.map(s => ({ ...s, supervisionType: 'Klasik' }))
      ];

      // Group by teacherId -> find latest supervision per teacher
      const teacherLatestMap = new Map<string, { grade: string; score: number; date: string; type: string; count: number }>();
      enrichedWithType.forEach(s => {
        const existing = teacherLatestMap.get(s.teacherId);
        const sDate = new Date(s.date).getTime();
        if (!existing || sDate > new Date(existing.date).getTime()) {
          teacherLatestMap.set(s.teacherId, {
            grade: s.grade || '',
            score: s.score,
            date: s.date,
            type: s.supervisionType,
            count: (existing?.count || 0) + 1
          });
        } else {
          teacherLatestMap.set(s.teacherId, { ...existing, count: existing.count + 1 });
        }
      });

      // Teachers with C or D in ANY supervision (latest)
      const lowGrade: TeacherSummary[] = [];
      teacherLatestMap.forEach((data, teacherId) => {
        if (data.grade === 'C' || data.grade === 'D') {
          const teacher = filteredTeachers.find(t => t.id === teacherId);
          if (teacher) {
            lowGrade.push({
              teacher,
              latestGrade: data.grade,
              latestScore: data.score,
              latestDate: data.date,
              type: data.type,
              totalSupervisions: data.count
            });
          }
        }
      });
      // Sort by grade (D first, then C), then by score ascending
      lowGrade.sort((a, b) => {
        if (a.latestGrade !== b.latestGrade) return a.latestGrade > b.latestGrade ? 1 : -1;
        return a.latestScore - b.latestScore;
      });
      setLowGradeTeachers(lowGrade);

      // ===== SUMMARY: Teachers never supervised =====
      const supervisedTeacherIds = new Set(enrichedWithType.map(s => s.teacherId));
      const neverSupervised = filteredTeachers.filter(t => !supervisedTeacherIds.has(t.id));
      setNeverSupervisedTeachers(neverSupervised);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitFilter(e.target.value as 'RA' | 'SD' | 'SMP' | '');
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const growthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } },
        title: {
          display: true,
          text: 'Jumlah Guru',
          font: { weight: 'bold' as const }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 'bold' as const } },
        title: {
          display: true,
          text: 'Tahun Ajaran',
          font: { weight: 'bold' as const }
        }
      }
    }
  };

  const barChartData = {
    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (<70)'],
    datasets: [
      {
        label: 'Distribusi Nilai',
        data: [gradeData.A, gradeData.B, gradeData.C, gradeData.D],
        backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#6b7280'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribusi Nilai Keseluruhan',
        color: '#1e40af',
        font: { size: 16, weight: 'bold' as const }
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Ringkasan</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium flex items-center">
            <Activity size={16} className="mr-2 text-blue-500" />
            Statistik dan Analisis Performa Guru Nurul Aulia
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
            <Filter size={18} className="text-blue-600" />
            <select
              value={unitFilter}
              onChange={handleUnitFilterChange}
              className="border-none text-blue-700 focus:outline-none bg-transparent text-sm font-bold"
              disabled={loading}
            >
              <option value="">Semua Unit</option>
              <option value="RA">Unit RA</option>
              <option value="SD">Unit SD</option>
              <option value="SMP">Unit SMP</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
            <Calendar size={18} className="text-emerald-600" />
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="border-none text-emerald-700 focus:outline-none bg-transparent text-sm font-bold"
              disabled={loading}
            >
              <option value="">Semua Supervisi</option>
              <option value="ADM">Administrasi</option>
              <option value="KBM">KBM / Akademik</option>
              <option value="Klasik">Budaya Klasik</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Menganalisis data performa...</p>
        </div>
      ) : (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg w-fit mb-4">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Guru</h3>
                <p className="text-3xl font-black text-gray-900 mt-1">{teacherCount}</p>
                <p className="text-[10px] text-blue-500 font-bold mt-2 flex items-center">
                  <Info size={12} className="mr-1" />
                  {unitFilter ? `Unit ${unitFilter}` : 'Terintegrasi RA, SD, SMP'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg w-fit mb-4">
                  <Activity size={20} />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Supervisi ADM</h3>
                <p className="text-3xl font-black text-gray-900 mt-1">{adminSupervisionCount}</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-2">Update terakhir 2024</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg w-fit mb-4">
                  <Award size={20} />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Supervisi KBM</h3>
                <p className="text-3xl font-black text-gray-900 mt-1">{kbmSupervisionCount}</p>
                <p className="text-[10px] text-amber-500 font-bold mt-2">Observasi Akademik</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg w-fit mb-4">
                  <CheckCircle size={20} />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Supervisi Klasik</h3>
                <p className="text-3xl font-black text-gray-900 mt-1">{classicSupervisionCount}</p>
                <p className="text-[10px] text-purple-500 font-bold mt-2">Budaya & Karakter</p>
              </div>
            </div>
          </div>

          {/* PERFORMANCE GROWTH CHART SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-red-500 to-amber-500"></div>
            
            <div className="flex flex-col items-center mb-10">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight text-center">
                PERTUMBUHAN PERFORMANCE<br />
                GURU DI NURUL AULIA
              </h2>
              <div className="h-1 w-20 bg-blue-600 mt-3 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-3">
                <div className="h-[400px] w-full bg-blue-50/30 rounded-2xl p-6 border border-blue-100/50">
                  {performanceGrowthData && (
                    <Bar data={performanceGrowthData} options={growthChartOptions} />
                  )}
                </div>
              </div>

              {/* Side Stats */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Distribusi Total</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-bold text-gray-700">Grade A</span>
                      </div>
                      <span className="text-lg font-black text-blue-600">{gradeData.A}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-bold text-gray-700">Grade B</span>
                      </div>
                      <span className="text-lg font-black text-red-600">{gradeData.B}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                        <span className="text-sm font-bold text-gray-700">Grade C</span>
                      </div>
                      <span className="text-lg font-black text-amber-600">{gradeData.C}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                  <p className="text-xs font-bold text-blue-100 uppercase mb-1">Status Performa</p>
                  <p className="text-lg font-bold">Trend Positif</p>
                  <p className="text-[10px] text-blue-100 mt-2 leading-relaxed">
                    Data menunjukkan peningkatan jumlah guru di Grade A pada periode terbaru.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== KESIMPULAN UMUM ===== */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
              <span className="mr-3 p-2 bg-red-100 rounded-xl text-red-600 shadow-sm">
                <TrendingDown size={24} />
              </span>
              EVALUASI PERFORMA & TINDAK LANJUT
            </h2>

            {/* Summary stat pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guru Nilai Grade D</p>
                  <p className="text-2xl font-bold text-red-600">{lowGradeTeachers.filter(t => t.latestGrade === 'D').length}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guru Nilai Grade C</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowGradeTeachers.filter(t => t.latestGrade === 'C').length}</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                  <UserX size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guru Belum Disupervisi</p>
                  <p className="text-2xl font-bold text-gray-700">{neverSupervisedTeachers.length}</p>
                </div>
              </div>
            </div>

            {/* Teachers with Grade C or D */}
            <div className="card">
              <div className="flex items-center mb-4 space-x-2">
                <AlertTriangle size={20} className="text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Guru dengan Nilai Supervisi Rendah (Grade C / D)
                </h3>
              </div>
              {lowGradeTeachers.length === 0 ? (
                <div className="flex items-center space-x-3 text-green-600 bg-green-50 rounded-lg p-4">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">Tidak ada guru dengan nilai Grade C atau D. Semua performa baik!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Guru</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nilai Terakhir</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rekomendasi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {lowGradeTeachers.map((item, idx) => (
                        <tr key={item.teacher.id} className={`hover:bg-red-50 transition-colors ${item.latestGrade === 'D' ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{item.teacher.name}</td>
                          <td className="px-4 py-3 text-gray-600">{item.teacher.unit}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{item.type}</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">{item.latestScore}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              item.latestGrade === 'D' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.latestGrade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{item.latestDate}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 italic">
                            {item.latestGrade === 'D'
                              ? '⚠️ Perlu pembinaan intensif & supervisi ulang segera'
                              : '📋 Perlu tindak lanjut & pendampingan lebih lanjut'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Teachers never supervised */}
            <div className="card">
              <div className="flex items-center mb-4 space-x-2">
                <UserX size={20} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Guru yang Belum Pernah Disupervisi
                </h3>
              </div>
              {neverSupervisedTeachers.length === 0 ? (
                <div className="flex items-center space-x-3 text-green-600 bg-green-50 rounded-lg p-4">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">Seluruh guru sudah pernah disupervisi. Sangat baik!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Guru</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis Kelamin</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {neverSupervisedTeachers.map((teacher, idx) => (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{teacher.name}</td>
                          <td className="px-4 py-3 text-gray-600">{teacher.unit}</td>
                          <td className="px-4 py-3 text-gray-600">{teacher.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 italic">📌 Segera dijadwalkan untuk supervisi</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
