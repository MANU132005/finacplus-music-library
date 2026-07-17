import { useState, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Music2, Disc, User as UserIcon, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Music Library', icon: Disc },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex items-center justify-between sticky top-0 z-35 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Music2 size={18} />
            </div>
            <span className="font-black text-slate-800 text-lg tracking-tight">FinacPlus</span>
          </Link>
        </div>

        {/* User Details & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserIcon size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700">{user.username}</p>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    user.role === 'admin'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600 px-3 py-2 hover:bg-red-50/50 rounded-xl transition-all"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Body */}
      <div className="flex-1 flex relative">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-100 p-5 space-y-2 flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">
            Navigation Menu
          </p>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Sidebar content */}
            <aside className="relative w-64 bg-white h-full p-5 space-y-6 flex flex-col justify-between z-10 animate-slideRight">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-black text-slate-800 tracking-tight">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile User Profile Header */}
              {user && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <UserIcon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {user.username}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 capitalize">
                      {user.role} Account
                    </span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
