import axios from 'axios';
import { Song, SongFormData } from '../types/song';

export const songService = {
  /**
   * Fetches songs matching a search term from the iTunes search API.
   * Direct normalization fallback ensures songs render cleanly even if MSW worker is bypassing or initializing.
   */
  getSongs: async (term: string = 'rock'): Promise<Song[]> => {
    const response = await axios.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song`
    );
    
    const rawResults = response.data.results || [];
    
    // Read custom added & deleted songs from localStorage
    const localAdded: Song[] = JSON.parse(localStorage.getItem('finacplus_custom_songs') || '[]');
    const localDeleted: string[] = JSON.parse(localStorage.getItem('finacplus_deleted_songs') || '[]');

    // Normalize raw iTunes API fields into clean Song interface if not already normalized by MSW
    const normalizedFetched: Song[] = rawResults.map((item: any) => ({
      id: String(item.id || item.trackId || Math.random()),
      title: item.title || item.trackName || 'Untitled Song',
      artist: item.artist || item.artistName || 'Unknown Artist',
      album: item.album || item.collectionName || 'Single / Unknown Album',
      year: item.year || item.releaseYear || (item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024),
      coverUrl: item.coverUrl || item.coverArt || item.artworkUrl100 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    }));

    // Merge custom added songs and filter out deleted ones
    const combined = [...localAdded, ...normalizedFetched];
    return combined.filter((song) => !localDeleted.includes(String(song.id)));
  },

  /**
   * Adds a new song via POST to the mocked MSW endpoint, with localStorage fallback.
   */
  addSong: async (songData: SongFormData): Promise<Song> => {
    try {
      const response = await axios.post<Song>('/songs', songData);
      return response.data;
    } catch {
      const newSong: Song = {
        id: `custom-${Date.now()}`,
        title: songData.title,
        artist: songData.artist,
        album: songData.album,
        year: songData.year,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      };
      const localAdded: Song[] = JSON.parse(localStorage.getItem('finacplus_custom_songs') || '[]');
      localStorage.setItem('finacplus_custom_songs', JSON.stringify([newSong, ...localAdded]));
      return newSong;
    }
  },

  /**
   * Deletes a song via DELETE to the mocked MSW endpoint by its ID, with localStorage fallback.
   */
  deleteSong: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/songs/${id}`);
    } catch {
      const localDeleted: string[] = JSON.parse(localStorage.getItem('finacplus_deleted_songs') || '[]');
      if (!localDeleted.includes(id)) {
        localStorage.setItem('finacplus_deleted_songs', JSON.stringify([...localDeleted, id]));
      }
    }
  },
};
