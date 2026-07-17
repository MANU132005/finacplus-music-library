import React from 'react';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  groupBy: 'none' | 'artist' | 'album';
  onGroupByChange: (val: 'none' | 'artist' | 'album') => void;
  isAdmin: boolean;
  onAddClick: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  groupBy,
  onGroupByChange,
  isAdmin,
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 md:p-5 mb-6 md:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-slate-100">
      {/* Search Input Box */}
      <div className="relative flex-1 w-full max-w-full lg:max-w-md">
        <label htmlFor="songSearch" className="sr-only">
          Search songs title, artist, or album
        </label>
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={18} aria-hidden="true" />
        </span>
        <input
          id="songSearch"
          type="search"
          placeholder="Search by title, artist, or album..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all text-sm text-slate-700 placeholder-slate-400 font-medium"
          role="searchbox"
        />
      </div>

      {/* Control Actions Panel */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full lg:w-auto">
        {/* Sort Controls Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <label
            htmlFor="sortBy"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
          >
            <SlidersHorizontal size={13} aria-hidden="true" /> Sort
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all cursor-pointer font-bold w-full sm:w-auto min-w-[130px]"
            aria-label="Sort song registry by attribute"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="artist-asc">Artist (A-Z)</option>
            <option value="year-desc">Year (Newest)</option>
            <option value="year-asc">Year (Oldest)</option>
          </select>
        </div>

        {/* Group By Controls Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <label
            htmlFor="groupBy"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0"
          >
            Group By
          </label>
          <select
            id="groupBy"
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as 'none' | 'artist' | 'album')}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all cursor-pointer font-bold w-full sm:w-auto min-w-[110px]"
            aria-label="Group song registry under subheaders"
          >
            <option value="none">None</option>
            <option value="artist">Artist</option>
            <option value="album">Album</option>
          </select>
        </div>

        {/* Add Song Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onAddClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-bold hover:bg-slate-850 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm focus:outline-none mt-2 sm:mt-0"
            aria-label="Open dialog to add a new song"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add Song</span>
          </button>
        )}
      </div>
    </div>
  );
};
