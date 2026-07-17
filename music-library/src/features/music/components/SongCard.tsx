import React from 'react';
import { Trash2, Music } from 'lucide-react';
import { Song } from '../../../types/song';

interface SongCardProps {
  song: Song;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isAdmin,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <div
      className={`group relative bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 hover:shadow-soft-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 animate-fadeIn ${
        isDeleting ? 'opacity-50 pointer-events-none scale-95' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={`${song.title} album cover art`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Music size={24} className="text-slate-400" aria-hidden="true" />
        )}
        {/* Decorative spinner groove lines on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
          <div className="w-10 h-10 border border-white/20 rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Info details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
        <div>
          <h3
            className="text-base font-bold text-slate-850 leading-snug truncate"
            title={song.title}
          >
            {song.title}
          </h3>
          <p className="text-sm font-semibold text-slate-500 truncate mt-0.5">
            {song.artist}
          </p>
          <p className="text-xs text-slate-400 truncate mt-1">
            Album: <span className="text-slate-500 font-medium">{song.album}</span>
          </p>
        </div>
        <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md w-fit mt-2">
          {song.year}
        </span>
      </div>

      {/* Delete button (Admin Only) */}
      {isAdmin && (
        <button
          onClick={() => onDelete(song.id)}
          disabled={isDeleting}
          className="absolute right-3 top-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:scale-[1.05] active:scale-95 rounded-xl transition-all duration-200 focus:outline-none"
          aria-label={`Delete song ${song.title} by ${song.artist}`}
          title="Delete Song"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
