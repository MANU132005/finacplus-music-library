import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        // Log login activity to local activity panel
        const logs = JSON.parse(localStorage.getItem('music_library_activity') || '[]');
        logs.unshift({
          id: Math.random().toString(36).substring(2, 9),
          action: `Logged in successfully as ${username}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        localStorage.setItem('music_library_activity', JSON.stringify(logs.slice(0, 10)));

        toast.success(`Welcome back, ${username}!`);
        navigate('/');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-soft-lg p-8 relative overflow-hidden flex flex-col gap-6">
        {/* Visual Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white mx-auto shadow-sm">
            <Music2 size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-3">Welcome to FinacPlus</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Music Registry Portal</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-semibold leading-relaxed">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all text-slate-700 placeholder-slate-400 font-medium"
                required
                aria-required="true"
                aria-invalid={!!error}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all text-slate-700 placeholder-slate-400 font-medium"
                required
                aria-required="true"
                aria-invalid={!!error}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-slate-950 hover:bg-slate-850 hover:scale-[1.01] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            aria-label="Sign In to Portal"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Credentials guide for reviewers */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-2 border border-slate-100 rounded-xl bg-white text-center">
              <p className="text-red-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Admin Account</p>
              <p className="text-slate-600"><span className="text-slate-400">User:</span> admin</p>
              <p className="text-slate-600"><span className="text-slate-400">Pass:</span> admin123</p>
            </div>
            <div className="p-2 border border-slate-100 rounded-xl bg-white text-center">
              <p className="text-blue-500 font-bold uppercase tracking-wider text-[9px] mb-0.5">Viewer Account</p>
              <p className="text-slate-600"><span className="text-slate-400">User:</span> user</p>
              <p className="text-slate-600"><span className="text-slate-400">Pass:</span> user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
