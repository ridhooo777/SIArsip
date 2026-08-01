import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Tags,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Shield,
  Archive,
  Bell,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { auth, notifications } = usePage().props as any;
  const user = auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const allNavItems = [
    { href: '/dashboard', routeName: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/documents', routeName: 'documents.index', icon: FileText, label: 'Arsip Resmi' },
    { href: '/documents/add', routeName: 'documents.create', icon: FolderOpen, label: 'Input Arsip Baru' },
    { href: '/categories', routeName: 'categories.index', icon: Tags, label: 'Kategori Dokumen', adminOnly: true },
    { href: '/reports', routeName: 'reports.index', icon: ClipboardList, label: 'Laporan', adminOnly: true },
    { href: '/activity-log', routeName: 'activity-log.index', icon: Archive, label: 'Log Aktivitas', adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.role === 'admin');

  const currentRouteMatches = (routeName: string) => {
    // Ziggy is available in window, so we can check using route().current()
    try {
      return (window as any).route().current(routeName);
    } catch {
      return window.location.pathname.startsWith(routeName.split('.')[0]);
    }
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = currentRouteMatches(item.routeName);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1 border border-gray-100">
              <img src="/images/logo-piksi.png" alt="Piksi Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">SIArsip</h1>
              <p className="text-xs text-gray-500">Politeknik Piksi Input Serang</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Menu Utama
          </p>
          <NavLinks />
        </div>

        {/* User Info */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate mb-1">{user?.email}</p>
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Admin (Pengelola)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  Staff (Pengguna)
                </span>
              )}
            </div>
          </div>
          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
                Sistem Informasi Arsip Digital
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Politeknik Piksi Input Serang
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-150 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">Notifikasi Terkini</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                        {notifications?.length || 0} Baru
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((log: any) => {
                          const logTime = new Date(log.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          const logDate = new Date(log.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          });

                          return (
                            <div key={log.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                              <p className="text-xs text-gray-800 font-medium">
                                <span className="font-bold text-blue-600">{log.user?.name || 'Sistem'}</span> {log.action_description || log.action}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {log.entity_type}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {logDate}, {logTime}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-xs">
                          Tidak ada aktivitas terbaru
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <Link
                        href="/activity-log"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs text-indigo-600 hover:text-indigo-500 font-bold hover:underline"
                      >
                        Lihat Semua Log Aktivitas
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Shield className="hidden sm:block w-5 h-5 text-green-600" />
            <span className="hidden sm:inline-flex text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Terhubung Aman
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
