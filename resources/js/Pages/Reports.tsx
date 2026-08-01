import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ClipboardList,
  Download,
  Printer,
  Filter,
  Calendar,
  Tag,
  FileText,
  BarChart3,
  PieChart,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/Layouts/Layout';

interface Category {
  id: number;
  name: string;
}

interface Document {
  id: number;
  reference_number: string | null;
  title: string;
  category_id: number;
  issuance_date: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  category?: {
    name: string;
  };
}

interface ReportsProps {
  documents: Document[];
  categories: Category[];
  summary: {
    totalDocuments: number;
    filteredCount: number;
    categoryBreakdown: Record<string, number>;
    generatedAt: string;
  } | null;
  filters: {
    category_id?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
  };
}

export default function Reports({ documents, categories, summary, filters }: ReportsProps) {
  const [filterCategory, setFilterCategory] = useState(filters.category_id || '');
  const [filterFromDate, setFilterFromDate] = useState(filters.from_date || '');
  const [filterToDate, setFilterToDate] = useState(filters.to_date || '');
  const [filterStatus, setFilterStatus] = useState(filters.status || '');
  const [generating, setGenerating] = useState(false);

  const generateReport = () => {
    setGenerating(true);
    router.get(
      '/reports',
      {
        category_id: filterCategory,
        from_date: filterFromDate,
        to_date: filterToDate,
        status: filterStatus,
      },
      {
        preserveState: true,
        onFinish: () => setGenerating(false),
      }
    );
  };

  const exportToPDF = () => {
    if (!documents || documents.length === 0) return;

    // Dynamic import of jsPDF
    import('jspdf').then((module) => {
      const { jsPDF } = module;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 15;

      // Letterhead
      doc.setFillColor(25, 55, 109);
      doc.rect(0, 0, pageWidth, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('POLITEKNIK PIKSI INPUT SERANG', pageWidth / 2, 14, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Jalan Raya Jl. Serang-Cilegon No.KM.08, Kramatwatu, Kec. Kramatwatu, Kabupaten Serang, Banten 42161', pageWidth / 2, 21, { align: 'center' });
      doc.text('Telp: 0812-1933-3386 | Website: https://pis.ac.id/', pageWidth / 2, 27, { align: 'center' });

      // Decorative lines
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1);
      doc.line(10, 33, pageWidth - 10, 33);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.line(10, 34.5, pageWidth - 10, 34.5);

      // Title
      yPos = 46;
      doc.setTextColor(25, 55, 109);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN REKAPITULASI ARSIP DIGITAL', pageWidth / 2, yPos, { align: 'center' });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const now = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`Dicetak pada: ${now}`, pageWidth / 2, yPos, { align: 'center' });

      // Summary Stats
      yPos += 12;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(10, yPos, pageWidth - 20, 22, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 55, 109);
      doc.text('Ringkasan Data', 15, yPos + 7);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Total Dokumen: ${summary?.totalDocuments || 0}  |  Ditampilkan: ${summary?.filteredCount || 0}  |  Kategori: ${Object.keys(summary?.categoryBreakdown || {}).length}`,
        15,
        yPos + 16
      );

      // Table Header
      yPos += 28;
      doc.setFillColor(25, 55, 109);
      doc.rect(10, yPos, pageWidth - 20, 8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('No', 13, yPos + 5.5);
      doc.text('Judul Dokumen', 22, yPos + 5.5);
      doc.text('No. Surat', 85, yPos + 5.5);
      doc.text('Kategori', 125, yPos + 5.5);
      doc.text('Tanggal', 155, yPos + 5.5);
      doc.text('Status', 178, yPos + 5.5);

      // Table Rows
      yPos += 10;
      doc.setFont('helvetica', 'normal');

      documents.forEach((document, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 15;
        }

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 252);
          doc.rect(10, yPos - 2, pageWidth - 20, 8, 'F');
        }

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(7.5);
        doc.text(String(index + 1), 13, yPos + 4);

        const title = document.title.length > 35 ? document.title.substring(0, 35) + '...' : document.title;
        doc.text(title, 22, yPos + 4);

        const refNum = (document.reference_number || '-').length > 18 ? (document.reference_number || '-').substring(0, 18) + '...' : (document.reference_number || '-');
        doc.text(refNum, 85, yPos + 4);

        doc.text(document.category?.name || '-', 125, yPos + 4);

        const dateStr = document.issuance_date ? new Date(document.issuance_date).toLocaleDateString('id-ID') : '-';
        doc.text(dateStr, 155, yPos + 4);

        doc.text(document.status || 'aktif', 178, yPos + 4);

        yPos += 8;
      });

      // Signature Section
      yPos = Math.max(yPos + 15, 240);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('Menyetujui,', 130, yPos);
      doc.text('Kepala Bagian Umum', 130, yPos + 5);

      doc.line(130, yPos + 35, 185, yPos + 35);
      doc.setFont('helvetica', 'bold');
      doc.text('(___________________________)', 130, yPos + 40);
      doc.setFont('helvetica', 'normal');
      doc.text('NIP. _______________________', 130, yPos + 45);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`SIArsip - Sistem Informasi Arsip Digital | Halaman ${i} dari ${pageCount}`, pageWidth / 2, 292, { align: 'center' });
      }

      doc.save(`Laporan_Arsip_PoltekPiksi_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  const printReport = () => {
    if (!documents || documents.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Arsip - Politeknik Piksi Input Serang</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
          .letterhead { background: #19376d; color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; }
          .letterhead h1 { margin: 0; font-size: 18px; }
          .letterhead p { margin: 4px 0; font-size: 10px; opacity: 0.9; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #19376d; color: white; padding: 8px; text-align: left; font-size: 10px; }
          td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 9px; }
          tr:nth-child(even) { background: #f8f9fa; }
          .signature { margin-top: 40px; float: right; text-align: center; width: 180px; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <h1>POLITEKNIK PIKSI INPUT SERANG</h1>
          <p>Jalan Raya Jl. Serang-Cilegon No.KM.08, Kramatwatu, Kec. Kramatwatu, Kabupaten Serang, Banten 42161</p>
          <p>Telp: 0812-1933-3386 | Website: https://pis.ac.id/</p>
        </div>
        <h2 style="text-align:center; color:#19376d;">LAPORAN REKAPITULASI ARSIP DIGITAL</h2>
        <p style="text-align:center; color:#666; font-size:10px;">Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p style="margin:15px 0;"><strong>Total Dokumen:</strong> ${documents.length}</p>
        <table>
          <thead>
            <tr><th>No</th><th>Judul Dokumen</th><th>No. Surat</th><th>Kategori</th><th>Tanggal</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${documents
              .map(
                (d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${d.title}</td>
                <td>${d.reference_number || '-'}</td>
                <td>${d.category?.name || '-'}</td>
                <td>${d.issuance_date ? new Date(d.issuance_date).toLocaleDateString('id-ID') : '-'}</td>
                <td>${d.status || 'aktif'}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <div class="signature">
          <p>Menyetujui,</p>
          <p>Kepala Bagian Umum</p>
          <div class="signature-line"></div>
          <p>(___________________________)</p>
          <p>NIP. _______________________</p>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          Laporan Arsip
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Generate dan ekspor laporan rekapitulasi arsip digital
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          Parameter Laporan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} /> Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} /> Dari Tanggal
            </label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} /> Sampai Tanggal
            </label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
              <option value="arsip">Diarsipkan</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={generateReport}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Membuat Laporan...</>
            ) : (
              <><BarChart3 size={18} /> Generate Laporan</>
            )}
          </button>
        </div>
      </div>

      {/* Report Results */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Dokumen</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalDocuments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ditampilkan</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.filteredCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(summary.categoryBreakdown).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi per Kategori</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(summary.categoryBreakdown).map(([catName, count]) => (
                <div key={catName} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{catName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={exportToPDF}
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
            >
              <Download size={18} />
              Export ke PDF
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors shadow-lg"
            >
              <Printer size={18} />
              Cetak / Print
            </button>
          </div>

          {/* Documents Table Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Judul</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">No. Surat</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Kategori</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.slice(0, 15).map((doc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{doc.title}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 hidden sm:table-cell font-mono text-xs">{doc.reference_number || '-'}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{doc.category?.name || '-'}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {doc.issuance_date ? new Date(doc.issuance_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {doc.status || 'aktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {documents.length > 15 && (
              <div className="px-5 py-3 bg-gray-50 text-center text-sm text-gray-500">
                Menampilkan 15 dari {documents.length} dokumen. Export PDF untuk melihat lengkap.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

Reports.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
