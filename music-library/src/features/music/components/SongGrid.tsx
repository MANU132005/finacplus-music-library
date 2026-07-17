import React from 'react';
import { SongCard } from './SongCard';
import { Song } from '../../../types/song';

interface SongGridProps {
  songs: Song[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export const SongGrid: React.FC<SongGridProps> = ({
  songs,
  isAdmin,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          isAdmin={isAdmin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
