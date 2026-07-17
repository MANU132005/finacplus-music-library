import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Music, 
  Users, 
  Disc, 
  Shield, 
  ArrowRight, 
  Clock, 
  Plus, 
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  coverUrl: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Fetch the normalized and merged songs list (goes through MSW to include custom added/deleted songs)
  const { data: songs = [], isLoading } = useQuery<Song[], Error>({
    queryKey: ['songs', 'rock'], // Match MFE query key so they share cache status
    queryFn: async () => {
      const response = await axios.get<{ results: Song[] }>(
        'https://itunes.apple.com/search?term=rock&entity=song'
      );
      return response.data.results || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Rehydrate activity logs from localStorage on load
  useEffect(() => {
    const logs = localStorage.getItem('music_library_activity');
    if (logs) {
      setActivityLogs(JSON.parse(logs));
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Stats calculation
  const totalSongs = songs.length;
  const totalArtists = new Set(songs.map((s: Song) => s.artist)).size;
  const totalAlbums = new Set(songs.map((s: Song) => s.album)).size;

  // Most recent 5 songs by release year descending
  const recentSongs = [...songs]
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  const handleAddSongRedirect = () => {
    navigate('/library', { state: { openAddModal: true } });
  };

  const handleBrowseRedirect = () => {
    navigate('/library');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn space-y-8">
      {/* Top Section - Greeting */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            {getGreeting()}, {user?.username}! <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
          </h1>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Internal Operations Registry Control Panel
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
          <Shield size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Role: {user?.role || 'user'}
          </span>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Songs */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Music size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Songs</p>
            <h3 className="text-2xl font-black text-slate-850 tracking-tight mt-0.5">
              {isLoading ? '...' : totalSongs}
            </h3>
          </div>
        </div>

        {/* Total Artists */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Artists</p>
            <h3 className="text-2xl font-black text-slate-850 tracking-tight mt-0.5">
              {isLoading ? '...' : totalArtists}
            </h3>
          </div>
        </div>

        {/* Total Albums */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Disc size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Albums</p>
            <h3 className="text-2xl font-black text-slate-850 tracking-tight mt-0.5">
              {isLoading ? '...' : totalAlbums}
            </h3>
          </div>
        </div>

        {/* Current Account Status */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-soft p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">System Access</p>
            <h3 className="text-lg font-black text-slate-850 tracking-tight mt-0.5 uppercase tracking-wide">
              {user?.role === 'admin' ? 'Write + Read' : 'Read Only'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Sections (Recent Songs & Info Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Songs */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Recent Songs Addition</h2>
            <button 
              onClick={handleBrowseRedirect}
              className="text-xs font-bold text-slate-500 hover:text-slate-950 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentSongs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No songs available in registry.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <img
                    src={song.coverUrl}
                    alt={`${song.title} cover`}
                    className="w-11 h-11 object-cover rounded-lg bg-slate-100 flex-shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate leading-snug">{song.title}</p>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{song.artist}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                    {song.year}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">
              Quick Actions
            </h2>
            {user?.role === 'admin' ? (
              <button
                onClick={handleAddSongRedirect}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-xl text-sm font-bold hover:bg-slate-850 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm focus:outline-none"
              >
                <Plus size={16} />
                <span>Add Song Record</span>
              </button>
            ) : (
              <button
                onClick={handleBrowseRedirect}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-xl text-sm font-bold hover:bg-slate-850 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm focus:outline-none"
              >
                <span>Browse Registry</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Activity Log Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock size={16} className="text-slate-400" />
              <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
            </div>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent actions recorded.</p>
            ) : (
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-start gap-4 text-xs">
                    <p className="font-semibold text-slate-600 leading-relaxed">{log.action}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
