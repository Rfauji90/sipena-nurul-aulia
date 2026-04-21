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
import { Filter, AlertTriangle, UserX, TrendingDown, CheckCircle } from 'lucide-react';

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
  const [teachersByUnit, setTeachersByUnit] = useState({ RA: 0, SD: 0, SMP: 0 });
  const [loading, setLoading] = useState(false);

  // Summary states
  const [lowGradeTeachers, setLowGradeTeachers] = useState<TeacherSummary[]>([]);
  const [neverSupervisedTeachers, setNeverSupervisedTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    loadData();
  }, [unitFilter]);

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

      // Calculate grade distribution
      const allSupervisions = [
        ...adminSupervisions, 
        ...kbmSupervisions, 
        ...classicSupervisions
      ];
      
      const grades = { A: 0, B: 0, C: 0, D: 0 };
      allSupervisions.forEach(supervision => {
        if (supervision.grade) {
          grades[supervision.grade as keyof typeof grades]++;
        }
      });
      
      setGradeData(grades);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitFilter(e.target.value as 'RA' | 'SD' | 'SMP' | '');
  };

  const barChartData = {
    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (<70)'],
    datasets: [
      {
        label: 'Distribusi Nilai',
        data: [gradeData.A, gradeData.B, gradeData.C, gradeData.D],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribusi Nilai Supervisi',
        color: '#1e40af',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow">
          <Filter size={18} className="text-blue-600" />
          <select
            value={unitFilter}
            onChange={handleFilterChange}
            className="border-none text-blue-700 focus:outline-none bg-transparent text-sm font-medium"
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
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      ) : (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-600 rounded-lg shadow-lg p-6 text-white transform transition-all hover:scale-105">
              <h3 className="text-sm text-blue-100 font-medium">Total Guru</h3>
              <p className="text-3xl font-bold mt-2">{teacherCount}</p>
              <div className="text-xs mt-3 text-blue-100">
                {!unitFilter && (
                  <span>
                    RA: {teachersByUnit.RA} | SD: {teachersByUnit.SD} | SMP: {teachersByUnit.SMP}
                  </span>
                )}
                {unitFilter && <span>Unit {unitFilter}</span>}
              </div>
            </div>
            <div className="bg-blue-700 rounded-lg shadow-lg p-6 text-white transform transition-all hover:scale-105">
              <h3 className="text-sm text-blue-100 font-medium">Supervisi ADM</h3>
              <p className="text-3xl font-bold mt-2">{adminSupervisionCount}</p>
              <div className="text-xs mt-3 text-blue-100">
                {unitFilter ? `Unit ${unitFilter}` : 'Semua Unit'}
              </div>
            </div>
            <div className="bg-blue-800 rounded-lg shadow-lg p-6 text-white transform transition-all hover:scale-105">
              <h3 className="text-sm text-blue-100 font-medium">Supervisi KBM</h3>
              <p className="text-3xl font-bold mt-2">{kbmSupervisionCount}</p>
              <div className="text-xs mt-3 text-blue-100">
                {unitFilter ? `Unit ${unitFilter}` : 'Semua Unit'}
              </div>
            </div>
            <div className="bg-blue-900 rounded-lg shadow-lg p-6 text-white transform transition-all hover:scale-105">
              <h3 className="text-sm text-blue-100 font-medium">Supervisi Klasik</h3>
              <p className="text-3xl font-bold mt-2">{classicSupervisionCount}</p>
              <div className="text-xs mt-3 text-blue-100">
                {unitFilter ? `Unit ${unitFilter}` : 'Semua Unit'}
              </div>
            </div>
          </div>

          {/* Bar Chart for Grade Distribution */}
          <div className="card">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          {/* ===== KESIMPULAN UMUM ===== */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2 p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <TrendingDown size={20} />
              </span>
              Kesimpulan Umum Supervisi
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
