import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Tags,
  CheckCircle2,
  HardDrive,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  FolderOpen,
  Users,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data.stats);
      setRecentDocs(data.recentDocuments || []);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      CREATE: { label: 'Menambah', color: 'bg-green-100 text-green-700' },
      UPDATE: { label: 'Memperbarui', color: 'bg-blue-100 text-blue-700' },
      DELETE: { label: 'Menghapus', color: 'bg-red-100 text-red-700' },
      UPLOAD: { label: 'Mengunggah', color: 'bg-purple-100 text-purple-700' },
      DOWNLOAD: { label: 'Mengunduh', color: 'bg-orange-100 text-orange-700' },
      REPORT: { label: 'Laporan', color: 'bg-cyan-100 text-cyan-700' },
      LOGIN: { label: 'Login', color: 'bg-indigo-100 text-indigo-700' },
    };
    return labels[action] || { label: action, color: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Arsip',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Kategori',
      value: stats?.totalCategories || 0,
      icon: Tags,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Arsip Aktif',
      value: stats?.activeDocuments || 0,
      icon: CheckCircle2,
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Penyimpanan',
      value: stats?.totalStorageFormatted || '0 KB',
      icon: HardDrive,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div variants={item} className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat Datang di SIArsip! 📁
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base">
            Sistem Informasi Arsip Digital Politeknik Piksi Input Serang.
            Kelola, simpan, dan lacak seluruh surat menyurat kampus dengan aman dan efisien.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/documents/add"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm shadow-lg"
            >
              <Plus size={18} />
              Input Arsip Baru
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/25 transition-colors text-sm border border-white/20"
            >
              <TrendingUp size={18} />
              Buat Laporan
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`${stat.bgColor} rounded-2xl p-5 border border-gray-100 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className={`text-2xl md:text-3xl font-bold ${stat.textColor}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('id-ID') : stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={18} className="text-blue-600" />
              Arsip Terbaru
            </h3>
            <Link
              to="/documents"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-5">
            {recentDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Belum ada arsip</p>
                <Link to="/documents/add" className="text-blue-600 text-sm font-medium mt-2 inline-block">
                  Tambah arsip pertama →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.categories?.name || 'Tanpa Kategori'} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {doc.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              Aktivitas Terakhir
            </h3>
            <Link
              to="/activity-log"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-5">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log, idx) => {
                  const actionInfo = getActionLabel(log.action);
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${actionInfo.color}`}>
                        {log.users?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{log.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}