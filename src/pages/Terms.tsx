import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FileText size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-blue-700">Syarat & Ketentuan</h1>
        </div>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-3">1. Ketentuan Umum</h2>
            <p>
              Sistem Aplikasi Pengumpulan Nilai dan Supervisi Guru ini dirancang khusus untuk digunakan oleh 
              <span className="italic font-medium"> Kepala Sekolah, Supervisor, dan pimpinan terkait </span> 
              dalam rangka pengelolaan dan evaluasi akademik serta kinerja guru.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-3">2. Hak Akses & Kerahasiaan</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Hak akses ke dalam sistem ini <span className="italic font-medium">hanya diberikan kepada pengguna yang berwenang</span> sesuai dengan kebijakan lembaga.
              </li>
              <li>
                Dilarang menyebarluaskan <span className="italic font-medium">tautan, kredensial, maupun informasi dalam sistem ini</span> kepada pihak lain yang tidak berwenang.
              </li>
              <li>
                Setiap pengguna bertanggung jawab atas keamanan akun dan data yang diakses dalam sistem ini.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-3">3. Penggunaan Data</h2>
            <ul className="list-disc pl-6">
              <li>
                Data dalam sistem ini hanya boleh digunakan untuk keperluan akademik dan supervisi sesuai dengan tugas dan wewenang pengguna.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-3">4. Pelanggaran & Sanksi</h2>
            <ul className="list-disc pl-6">
              <li>
                Jika ditemukan adanya penyalahgunaan atau kebocoran informasi, harap segera melaporkan kepada pihak yang berwenang.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-3">5. Kontak Bantuan</h2>
            <p>Jika mengalami kendala dalam penggunaan sistem, silakan menghubungi:</p>
            <div className="mt-2 pl-6">
              <p className="flex items-center">
                <span className="mr-2">📞</span> 
                <span className="italic font-medium">WhatsApp:</span> 0857-2406-3209
              </p>
              <p className="flex items-center">
                <span className="mr-2">📧</span> 
                <span className="italic font-medium">Email:</span> contact.sbsna@gmail.com
              </p>
            </div>
          </section>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-center">
              Dengan mengakses dan menggunakan sistem ini, pengguna dianggap telah memahami dan menyetujui seluruh ketentuan yang berlaku.
            </p>
            <p className="text-center mt-4 italic font-medium">
              Terima kasih atas kerja sama dan kepatuhannya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
