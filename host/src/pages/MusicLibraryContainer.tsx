import React, { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Lazy load the remote Micro Frontend component exposed via Module Federation
const MusicLibraryRemote = lazy(() => import('music_library/MusicLibraryApp'));

export const MusicLibraryContainer: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 rounded-lg w-52" />
              <div className="h-4 bg-slate-200 rounded-lg w-80" />
            </div>
          </div>

          {/* Filter Bar Skeleton */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-8 h-20 border border-slate-100 flex items-center justify-between">
            <div className="h-10 bg-slate-100 rounded-xl w-72" />
            <div className="flex gap-4">
              <div className="h-10 bg-slate-100 rounded-xl w-24" />
              <div className="h-10 bg-slate-100 rounded-xl w-24" />
            </div>
          </div>

          {/* Card Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 shadow-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <MusicLibraryRemote userRole={user?.role || 'user'} toast={toast} />
    </Suspense>
  );
};
