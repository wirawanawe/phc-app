"use client";

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">PHC</h3>
            <p className="text-sm text-gray-300">
              Platform kesehatan terintegrasi untuk semua kebutuhan kesehatan
              Anda.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Layanan</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Pencarian Dokter</li>
              <li>Janji Temu Online</li>
              <li>Konsultasi Virtual</li>
              <li>Artikel Kesehatan</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Tentang Kami</li>
              <li>Karir</li>
              <li>Hubungi Kami</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>support@phc.com</li>
              <li>+62 21 1234 5678</li>
              <li>Jl. Kesehatan No. 123, Jakarta</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} PHC. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <span className="text-sm text-gray-400">Privacy Policy</span>
            <span className="text-sm text-gray-400">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
