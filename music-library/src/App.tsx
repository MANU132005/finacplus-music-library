import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MusicLibrary from './features/music';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Music Library MFE</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md">
              Standalone Remote
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-755 rounded-full border border-emerald-100">
            Developer Sandbox Mode
          </span>
        </header>
        <main className="p-4 md:p-8">
          <MusicLibrary userRole="admin" />
        </main>
      </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
