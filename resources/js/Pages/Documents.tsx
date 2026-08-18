import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Tag,
  X,
  FileIcon,
  Loader2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  expired_at?: string | null;
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

interface DocumentsProps {
  documents: Document[];
  categories: Category[];
  filters: {
    category_id?: string;
    status?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: string;
  };
}

export default function Documents({ documents, categories, filters }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [filterCategory, setFilterCategory] = useState(filters.category_id || '');
  const [filterStatus, setFilterStatus] = useState(filters.status || '');
  const [filterFromDate, setFilterFromDate] = useState(filters.from_date || '');
  const [filterToDate, setFilterToDate] = useState(filters.to_date || '');
  const [showFilters, setShowFilters] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterStatus, filterFromDate, filterToDate]);

  const applyFilters = () => {
    router.get(
      '/documents',
      {
        search: searchTerm,
        category_id: filterCategory,
        status: filterStatus,
        from_date: filterFromDate,
        to_date: filterToDate,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleDownload = (doc: Document) => {
    if (!doc.file_url) {
      alert('Dokumen ini tidak memiliki file terlampir');
      return;
    }
    // Access direct Laravel download route
    window.location.href = `/documents/${doc.id}/download`;
  };

  const handleDelete = (doc: Document) => {
    if (!confirm(`Hapus arsip "${doc.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    router.delete(`/documents/${doc.id}`);
  };

  const handleDeactivate = (doc: Document) => {
    if (!confirm(`Nonaktifkan status arsip "${doc.title}" secara manual?`)) return;
    router.put(`/documents/${doc.id}`, {
      status: 'non-aktif',
    }, {
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterFromDate('');
    setFilterToDate('');
  };

  const hasActiveFilters = searchTerm || filterCategory || filterStatus || filterFromDate || filterToDate;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileIcon size={20} className="text-gray-400" />;
    if (fileType.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    if (fileType.includes('image')) return <FileIcon size={20} className="text-green-500" />;
    return <FileIcon size={20} className="text-gray-400" />;
  };

  // Pagination
  const totalPages = Math.ceil(documents.length / pageSize);
  const paginatedDocs = documents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Daftar Arsip Surat
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {documents.length} dokumen terarsip
          </p>
        </div>
        <Link
          href="/documents/add"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          + Input Arsip Baru
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor surat, judul, deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium text-sm transition-colors bg-white ${
              hasActiveFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filter
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                {[filterCategory, filterStatus, filterFromDate, filterToDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-Aktif</option>
                    <option value="arsip">Diarsipkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <X size={14} /> Reset Filter
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {paginatedDocs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak Ada Arsip</h3>
            <p className="text-gray-500 text-sm mb-4">
              {hasActiveFilters ? 'Coba ubah filter pencarian' : 'Mulai dengan menambahkan arsip pertama'}
            </p>
            {!hasActiveFilters && (
              <Link
                href="/documents/add"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + Input Arsip Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dokumen</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">No. Surat</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Kategori</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            {getFileIcon(doc.file_type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{doc.title}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              {doc.file_name || 'Tidak ada file'}
                              {doc.file_size && <span>• {(doc.file_size / 1024).toFixed(1)} KB</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600 font-mono text-xs">{doc.reference_number || '-'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          <Tag size={12} className="mr-1" />
                          {doc.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(doc.issuance_date)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'aktif' ? 'bg-green-100 text-green-700' :
                          doc.status === 'nonaktif' || doc.status === 'non-aktif' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.status === 'non-aktif' ? 'non-aktif' : (doc.status || 'aktif')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.file_url && (
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Unduh"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          {doc.status === 'aktif' && (
                            <button
                              onClick={() => handleDeactivate(doc)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Nonaktifkan"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, documents.length)} dari {documents.length} dokumen
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-700 bg-white border border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Detail Dokumen</h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {getFileIcon(previewDoc.file_type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{previewDoc.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        previewDoc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {previewDoc.status || 'aktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Nomor Surat</p>
                    <p className="font-medium text-gray-900 font-mono">{previewDoc.reference_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Kategori</p>
                    <p className="font-medium text-gray-900">{previewDoc.category?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Tanggal Surat</p>
                    <p className="font-medium text-gray-900">{formatDate(previewDoc.issuance_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Diarsipkan</p>
                    <p className="font-medium text-gray-900">{formatDate(previewDoc.created_at)}</p>
                  </div>
                  {previewDoc.expired_at && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tanggal Jatuh Tempo</p>
                      <p className="font-medium text-gray-900">{formatDate(previewDoc.expired_at)}</p>
                    </div>
                  )}
                </div>

                {previewDoc.description && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Deskripsi</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{previewDoc.description}</p>
                  </div>
                )}

                {previewDoc.file_url && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Download size={18} />
                      Unduh File
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Documents.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
