import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Music, Sparkles } from 'lucide-react';
import { useSongsQuery, useAddSongMutation, useDeleteSongMutation } from '../../hooks/useSongsQuery';
import { FilterBar } from './components/FilterBar';
import { SongGrid } from './components/SongGrid';
import { GroupedSongs } from './components/GroupedSongs';
import { AddSongModal } from './components/AddSongModal';
import { Song, SongFormData } from '../../types/song';
import { useToast } from '../../context/ToastContext';

interface MusicLibraryProps {
  userRole?: 'admin' | 'user';
  toast?: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const LoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse" aria-hidden="true">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 rounded-lg w-52" />
        <div className="h-4 bg-slate-100 rounded-lg w-80" />
      </div>
    </div>

    {/* Filter Bar Skeleton */}
    <div className="bg-white rounded-2xl shadow-soft p-5 mb-8 h-20 border border-slate-100 flex items-center justify-between">
      <div className="h-10 bg-slate-100 rounded-xl w-full max-w-md" />
      <div className="flex gap-4">
        <div className="h-10 bg-slate-100 rounded-xl w-28" />
        <div className="h-10 bg-slate-100 rounded-xl w-28" />
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
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-2.5 bg-slate-200 rounded w-2/3" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-12 text-center max-w-md mx-auto my-12 animate-fadeIn">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4 animate-bounce">
      <AlertTriangle size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-800">Failed to load songs</h3>
    <p className="text-sm text-slate-500 mt-2">
      There was an issue fetching the music library. Please check your internet connection or mock services and try again.
    </p>
    <button
      onClick={onRetry}
      className="mt-6 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-850 active:scale-95 transition-all shadow-sm"
      aria-label="Retry network request"
    >
      Retry Connection
    </button>
  </div>
);

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-12 text-center max-w-md mx-auto my-12 animate-scaleIn">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-4">
      <Music size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-800">No Songs Found</h3>
    <p className="text-sm text-slate-500 mt-2">
      Try changing your search or filters.
    </p>
    <button
      onClick={onReset}
      className="mt-6 px-5 py-2.5 bg-slate-950 hover:bg-slate-850 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center mx-auto"
      aria-label="Reset all search filters"
    >
      Reset Filters
    </button>
  </div>
);

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ userRole = 'user', toast: toastProp }) => {
  const isAdmin = userRole === 'admin';
  const { toast: localToast } = useToast();
  const toast = toastProp || localToast;

  // Safely attempt useLocation read without throwing if unrouted
  let openAddModalInitial = false;
  try {
    const location = useLocation();
    openAddModalInitial = !!(location?.state as { openAddModal?: boolean })?.openAddModal;
  } catch {
    openAddModalInitial = false;
  }

  // Instant local state for the search input
  const [searchInputValue, setSearchInputValue] = useState('');
  
  // Debounced search state for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');
  const [groupBy, setGroupBy] = useState<'none' | 'artist' | 'album'>('none');
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitial);

  // Debounce effect: Wait 300ms after user stops typing before updating filter term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  // Fetch Songs Query
  const { data: songs = [], isLoading, isError, refetch } = useSongsQuery('rock');

  // Mutation Hooks
  const addSongMutation = useAddSongMutation('rock');
  const deleteSongMutation = useDeleteSongMutation('rock');

  const handleAddSongSubmit = async (formData: SongFormData) => {
    try {
      await addSongMutation.mutateAsync(formData);
      
      // Log activity to local activity panel
      const logs = JSON.parse(localStorage.getItem('music_library_activity') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        action: `Added song record: "${formData.title}" by ${formData.artist}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      localStorage.setItem('music_library_activity', JSON.stringify(logs.slice(0, 10)));

      toast.success('Song added successfully!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add song:', error);
      toast.error('Failed to add song. Please try again.');
    }
  };

  const handleDeleteSong = async (id: string) => {
    // Find song title for logs before mutation
    const targetSong = songs.find((s: Song) => s.id === id);
    const songName = targetSong ? `"${targetSong.title}"` : `ID ${id}`;
    
    try {
      await deleteSongMutation.mutateAsync(id);

      // Log activity to local activity panel
      const logs = JSON.parse(localStorage.getItem('music_library_activity') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        action: `Deleted song record: ${songName}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      localStorage.setItem('music_library_activity', JSON.stringify(logs.slice(0, 10)));

      toast.success('Song deleted successfully!');
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song. Recovered cache state.');
    }
  };

  const handleResetFilters = () => {
    setSearchInputValue('');
    setSearchTerm('');
    setSortBy('title-asc');
    setGroupBy('none');
    toast.info('Filters have been reset.');
  };

  // CLIENT-SIDE SEARCH FILTERING (MEMOIZED)
  const filteredSongs = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return songs.filter((song: Song) => {
      if (!query) return true;
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
      );
    });
  }, [songs, searchTerm]);

  // CLIENT-SIDE SORTING (MEMOIZED)
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        case 'title-desc':
          return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
        case 'artist-asc':
          return a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
        case 'year-desc':
          return b.year - a.year;
        case 'year-asc':
          return a.year - b.year;
        default:
          return 0;
      }
    });
  }, [filteredSongs, sortBy]);

  // Prevent layout shifts during early load state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            Songs Registry <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Displaying live iTunes catalog merged with real-time MSW local mocks.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <FilterBar
        searchTerm={searchInputValue}
        onSearchChange={setSearchInputValue}
        sortBy={sortBy}
        onSortChange={setSortBy}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        isAdmin={isAdmin}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : sortedSongs.length === 0 ? (
        <EmptyState onReset={handleResetFilters} />
      ) : groupBy === 'none' ? (
        <SongGrid
          songs={sortedSongs}
          isAdmin={isAdmin}
          onDelete={handleDeleteSong}
        />
      ) : (
        <GroupedSongs
          songs={sortedSongs}
          groupBy={groupBy}
          isAdmin={isAdmin}
          onDelete={handleDeleteSong}
        />
      )}

      {/* Add Song Form Modal (Admin Only) */}
      {isAdmin && (
        <AddSongModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSongSubmit}
          isSubmitting={addSongMutation.isPending}
        />
      )}
    </div>
  );
};

export default MusicLibrary;
