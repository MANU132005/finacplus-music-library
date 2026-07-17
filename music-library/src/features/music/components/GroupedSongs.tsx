import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { SongCard } from './SongCard';
import { Song } from '../../../types/song';

interface GroupedSongsProps {
  songs: Song[];
  groupBy: 'artist' | 'album';
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export const GroupedSongs: React.FC<GroupedSongsProps> = ({
  songs,
  groupBy,
  isAdmin,
  onDelete,
}) => {
  // Group the songs using native JavaScript reduce
  const groupedData = songs.reduce<Record<string, Song[]>>((acc, song) => {
    const key = groupBy === 'artist' ? song.artist : song.album;
    const groupName = key || `Unknown ${groupBy === 'artist' ? 'Artist' : 'Album'}`;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(song);
    return acc;
  }, {});

  // Sort group names alphabetically
  const sortedGroupNames = Object.keys(groupedData).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  // Keep track of collapsed states of groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="space-y-6">
      {sortedGroupNames.map((groupName) => {
        const groupSongs = groupedData[groupName];
        const isCollapsed = collapsedGroups[groupName];

        return (
          <div
            key={groupName}
            className="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden"
          >
            {/* Group Header Trigger */}
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 border-b border-slate-100 transition-colors text-left focus:outline-none"
              aria-expanded={!isCollapsed}
            >
              <div className="flex items-center gap-3">
                <Folder className="text-slate-400" size={20} />
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {groupName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {groupSongs.length} {groupSongs.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
              <span className="text-slate-400 p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors">
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
              </span>
            </button>

            {/* Group Songs Grid */}
            {!isCollapsed && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                  {groupSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isAdmin={isAdmin}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
