import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Excel Export
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// PDF Export for Single Supervision
export const generateSupervisionPDF = (supervision: any, teacher: any, type: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Laporan Hasil Supervisi', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Unit: ${teacher.unit}`, 105, 30, { align: 'center' });
  
  // Teacher Info
  doc.setFontSize(12);
  doc.text(`Nama Guru: ${teacher.name}`, 20, 45);
  doc.text(`Jenis Kelamin: ${teacher.gender === 'male' ? 'Laki-laki' : 'Perempuan'}`, 20, 52);
  doc.text(`Jabatan: ${teacher.position}`, 20, 59);
  doc.text(`Mata Pelajaran: ${teacher.subject}`, 20, 66);
  
  // Supervision Info
  doc.text(`Tipe Supervisi: ${type}`, 20, 80);
  doc.text(`Tanggal: ${supervision.date}`, 20, 87);
  doc.text(`Skor: ${supervision.score}`, 20, 94);
  doc.text(`Grade: ${supervision.grade}`, 20, 101);
  
  // Notes
  doc.text('Catatan:', 20, 115);
  const splitNotes = doc.splitTextToSize(supervision.notes, 170);
  doc.text(splitNotes, 20, 122);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 20, pageHeight - 10);
  
  doc.save(`Supervision_${teacher.name}_${supervision.date}.pdf`);
};

// PDF Export for Teacher List
export const exportTeachersToPDF = (teachers: any[]) => {
  const doc = new jsPDF();
  doc.text('Daftar Guru Sipena Nurul Aulia', 105, 15, { align: 'center' });
  
  const tableData = teachers.map((t, i) => [
    i + 1,
    t.name,
    t.gender === 'male' ? 'L' : 'P',
    t.unit,
    t.className,
    t.subject,
    t.position
  ]);
  
  autoTable(doc, {
    head: [['No', 'Nama', 'JK', 'Unit', 'Kelas', 'Mapel', 'Jabatan']],
    body: tableData,
    startY: 25,
  });
  
  doc.save(`Daftar_Guru_${new Date().toISOString().split('T')[0]}.pdf`);
};
