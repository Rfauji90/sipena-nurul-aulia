import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { 
  getTeachers,
  getAdminSupervisions,
  getKBMSupervisions,
  getClassicSupervisions,
  Supervision
} from '../utils/helpers';
import { Filter } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper function to sort supervisions by date
const sortByDate = (supervisions: Supervision[]) => {
  return [...supervisions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper function to group supervisions by month
const groupByMonth = (supervisions: Supervision[]) => {
  const grouped: { [key: string]: Supervision[] } = {};
  
  supervisions.forEach(supervision => {
    const date = new Date(supervision.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(supervision);
  });
  
  return Object.entries(grouped)
    .sort(([a], [b]) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    })
    .map(([monthYear, supervisions]) => {
      const [month, year] = monthYear.split('/');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      const total = supervisions.length;
      const avgScore = supervisions.reduce((sum, s) => sum + s.score, 0) / total;
      
      return {
        label,
        total,
        avgScore: Math.round(avgScore * 10) / 10
      };
    });
};

const Dashboard = () => {
  const [teacherCount, setTeacherCount] = useState(0);
  const [adminSupervisionCount, setAdminSupervisionCount] = useState(0);
  const [kbmSupervisionCount, setKbmSupervisionCount] = useState(0);
  const [classicSupervisionCount, setClassicSupervisionCount] = useState(0);
  const [gradeData, setGradeData] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [unitFilter, setUnitFilter] = useState<'RA' | 'SD' | 'SMP' | ''>('');
  const [teachersByUnit, setTeachersByUnit] = useState({ RA: 0, SD: 0, SMP: 0 });
  const [supervisionTrends, setSupervisionTrends] = useState<{
    labels: string[];
    admin: number[];
    kbm: number[];
    classic: number[];
    adminAvg: number[];
    kbmAvg: number[];
    classicAvg: number[];
  }>({
    labels: [],
    admin: [],
    kbm: [],
    classic: [],
    adminAvg: [],
    kbmAvg: [],
    classicAvg: []
  });
  const [loading, setLoading] = useState(false);

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

      // Process supervision trends data
      const adminByMonth = groupByMonth(adminSupervisions);
      const kbmByMonth = groupByMonth(kbmSupervisions);
      const classicByMonth = groupByMonth(classicSupervisions);
      
      // Combine all months from all supervision types
      const allMonths = new Set([
        ...adminByMonth.map(item => item.label),
        ...kbmByMonth.map(item => item.label),
        ...classicByMonth.map(item => item.label)
      ]);
      
      const sortedMonths = Array.from(allMonths).sort((a, b) => {
        const dateA = new Date(a.split(' ')[0] + ' 1, ' + a.split(' ')[1]);
        const dateB = new Date(b.split(' ')[0] + ' 1, ' + b.split(' ')[1]);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Create trends data with consistent labels
      const trends = {
        labels: sortedMonths,
        admin: sortedMonths.map(month => {
          const found = adminByMonth.find(item => item.label === month);
          return found ? found.total : 0;
        }),
        kbm: sortedMonths.map(month => {
          const found = kbmByMonth.find(item => item.label === month);
          return found ? found.total : 0;
        }),
        classic: sortedMonths.map(month => {
          const found = classicByMonth.find(item => item.label === month);
          return found ? found.total : 0;
        }),
        adminAvg: sortedMonths.map(month => {
          const found = adminByMonth.find(item => item.label === month);
          return found ? found.avgScore : 0;
        }),
        kbmAvg: sortedMonths.map(month => {
          const found = kbmByMonth.find(item => item.label === month);
          return found ? found.avgScore : 0;
        }),
        classicAvg: sortedMonths.map(month => {
          const found = classicByMonth.find(item => item.label === month);
          return found ? found.avgScore : 0;
        })
      };
      
      setSupervisionTrends(trends);
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

  const lineChartData = {
    labels: supervisionTrends.labels,
    datasets: [
      {
        label: 'Supervisi ADM',
        data: supervisionTrends.admin,
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.5)',
        tension: 0.2
      },
      {
        label: 'Supervisi KBM',
        data: supervisionTrends.kbm,
        borderColor: '#047857',
        backgroundColor: 'rgba(4, 120, 87, 0.5)',
        tension: 0.2
      },
      {
        label: 'Supervisi Klasik',
        data: supervisionTrends.classic,
        borderColor: '#b45309',
        backgroundColor: 'rgba(180, 83, 9, 0.5)',
        tension: 0.2
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Trend Pelaksanaan Supervisi',
        color: '#1e40af',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} supervisi`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah Supervisi'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Bulan'
        }
      }
    }
  };
  
  const scoreLineChartData = {
    labels: supervisionTrends.labels,
    datasets: [
      {
        label: 'Rata-rata Nilai ADM',
        data: supervisionTrends.adminAvg,
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.5)',
        tension: 0.2,
        yAxisID: 'y'
      },
      {
        label: 'Rata-rata Nilai KBM',
        data: supervisionTrends.kbmAvg,
        borderColor: '#047857',
        backgroundColor: 'rgba(4, 120, 87, 0.5)',
        tension: 0.2,
        yAxisID: 'y'
      },
      {
        label: 'Rata-rata Nilai Klasik',
        data: supervisionTrends.classicAvg,
        borderColor: '#b45309',
        backgroundColor: 'rgba(180, 83, 9, 0.5)',
        tension: 0.2,
        yAxisID: 'y'
      }
    ],
  };

  const scoreLineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Trend Nilai Rata-rata Supervisi',
        color: '#1e40af',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        title: {
          display: true,
          text: 'Rata-rata Nilai'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Bulan'
        }
      }
    }
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

          {/* Line Chart for Supervision Trends */}
          <div className="card">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>

          {/* Line Chart for Score Trends */}
          <div className="card">
            <Line data={scoreLineChartData} options={scoreLineChartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
