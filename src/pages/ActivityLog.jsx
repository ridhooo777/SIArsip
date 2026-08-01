import { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  Filter,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FilePlus,
  FileEdit,
  Trash2,
  Upload,
  Download,
  FileText as FileTextIcon,
  Eye,
  LogIn,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', pageSize);
      params.append('offset', (page - 1) * pageSize);
      if (filterAction) params.append('action', filterAction);

      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action) => {
    const configs = {
      CREATE: { icon: FilePlus, label: 'Menambah', color: 'bg-green-100 text-green-700', borderColor: 'border-l-green-500' },
      UPDATE: { icon: FileEdit, label: 'Memperbarui', color: 'bg-blue-100 text-blue-700', borderColor: 'border-l-blue-500' },
      DELETE: { icon: Trash2, label: 'Menghapus', color: 'bg-red-100 text-red-700', borderColor: 'border-l-red-500' },
      UPLOAD: { icon: Upload, label: 'Mengunggah', color: 'bg-purple-100 text-purple-700', borderColor: 'border-l-purple-500' },
      DOWNLOAD: { icon: Download, label: 'Mengunduh', color: 'bg-orange-100 text-orange-700', borderColor: 'border-l-orange-500' },
      REPORT: { icon: FileTextIcon, label: 'Laporan', color: 'bg-cyan-100 text-cyan-700', borderColor: 'border-l-cyan-500' },
      LOGIN: { icon: LogIn, label: 'Login', color: 'bg-indigo-100 text-indigo-700', borderColor: 'border-l-indigo-500' },
    };
    return configs[action] || { icon: Eye, label: action, color: 'bg-gray-100 text-gray-700', borderColor: 'border-l-gray-500' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  const actionOptions = [
    { value: '', label: 'Semua Aksi' },
    { value: 'CREATE', label: 'Menambah' },
    { value: 'UPDATE', label: 'Memperbarui' },
    { value: 'DELETE', label: 'Menghapus' },
    { value: 'UPLOAD', label: 'Mengunggah' },
    { value: 'DOWNLOAD', label: 'Mengunduh' },
    { value: 'REPORT', label: 'Laporan' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Archive className="w-7 h-7 text-blue-600" />
          Log Aktivitas Sistem
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Jejak audit semua aktivitas pengguna dalam sistem ({total} catatan)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {actionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Menampilkan halaman {page} dari {totalPages || 1}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum Ada Aktivitas</h3>
            <p className="text-gray-500 text-sm">Log aktivitas akan muncul di sini setelah ada interaksi dengan sistem</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log, idx) => {
              const config = getActionConfig(log.action);
              const ActionIcon = config.icon;
              return (
                <motion.div
                  key={log.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors border-l-4 ${config.borderColor}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    <ActionIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{log.details}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {log.users?.email || 'System'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(log.created_at)}
                      </span>
                      {log.ip_address && (
                        <span className="font-mono text-gray-400">IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}