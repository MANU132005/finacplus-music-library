import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { MusicLibraryContainer } from './pages/MusicLibraryContainer';
import { Dashboard } from './pages/Dashboard';
import { HelpCircle } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Route Guard to protect Dashboard Shell routes
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 404 Fallback View
const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="bg-white border border-slate-100 rounded-3xl shadow-soft-lg p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <HelpCircle size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2">
        The route you are trying to visit is not registered in our routing system.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
      >
        Return to Registry
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Authentication Endpoint */}
                <Route path="/login" element={<Login />} />

                {/* Protected Workspace Endpoints */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <MusicLibraryContainer />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
