import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  FileText,
  Upload,
  X,
  Save,
  Loader2,
  AlertCircle,
  Hash,
  Calendar,
  Tag,
  AlignLeft,
  Paperclip,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/Layouts/Layout';

interface Category {
  id: number;
  name: string;
}

interface AddDocumentProps {
  categories: Category[];
  errors: any;
}

export default function AddDocument({ categories, errors }: AddDocumentProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { data, setData, post, processing } = useForm({
    reference_number: '',
    title: '',
    category_id: '',
    issuance_date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'aktif',
    file: null as File | null,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setFileError('Ukuran file maksimal adalah 20MB');
      return;
    }

    setFileError(null);
    setData('file', file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setData('file', null);
    setFilePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.file) {
      setFileError('Wajib mengunggah file dokumen');
      return;
    }
    post('/documents');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-600" />
          Input Arsip Baru
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Isi detail dokumen dan unggah file arsip
        </p>
      </div>

      {/* Error Message */}
      {(Object.keys(errors).length > 0 || fileError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {fileError && <p>{fileError}</p>}
            {Object.values(errors).map((err: any, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Info Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Informasi Dokumen
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Hash size={14} /> Nomor Surat
              </label>
              <input
                type="text"
                value={data.reference_number}
                onChange={(e) => setData('reference_number', e.target.value)}
                placeholder="Contoh: 001/PPGS/I/2025"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Issuance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} /> Tanggal Surat
              </label>
              <input
                type="date"
                value={data.issuance_date}
                onChange={(e) => setData('issuance_date', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={14} /> Judul Dokumen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="Contoh: Surat Keputusan Rektor Tentang..."
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} /> Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={data.category_id}
              onChange={(e) => setData('category_id', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={14} /> Deskripsi/Keterangan
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="Deskripsi tambahan tentang dokumen ini..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Paperclip size={18} className="text-purple-600" />
            Unggah File Dokumen
          </h3>

          {!data.file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Klik atau seret file ke sini
                </p>
                <p className="text-gray-500 text-sm">
                  PDF, Image, Word, Excel, ZIP (Maks. 20MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{data.file.name}</p>
                <p className="text-xs text-gray-500">
                  {(data.file.size / 1024).toFixed(1)} KB • {data.file.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link
            href="/documents"
            className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save size={18} /> Simpan Arsip</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

AddDocument.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
