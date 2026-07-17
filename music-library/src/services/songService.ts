import axios from 'axios';
import { Song, SongFormData } from '../types/song';

export const songService = {
  /**
   * Fetches songs matching a search term from the iTunes search API.
   * Intercepted by MSW to normalize, merge custom-added songs, and filter out deleted ones.
   */
  getSongs: async (term: string = 'rock'): Promise<Song[]> => {
    const response = await axios.get<{ results: Song[] }>(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song`
    );
    return response.data.results || [];
  },

  /**
   * Adds a new song via POST to the mocked MSW endpoint.
   */
  addSong: async (songData: SongFormData): Promise<Song> => {
    const response = await axios.post<Song>('/songs', songData);
    return response.data;
  },

  /**
   * Deletes a song via DELETE to the mocked MSW endpoint by its ID.
   */
  deleteSong: async (id: string): Promise<void> => {
    await axios.delete(`/songs/${id}`);
  },
};
