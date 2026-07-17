import { http, HttpResponse, bypass } from 'msw';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  coverUrl: string;
}

const ADDED_SONGS_KEY = 'music_library_added_songs';
const DELETED_SONGS_KEY = 'music_library_deleted_songs';

const getAddedSongs = (): Song[] => {
  const data = localStorage.getItem(ADDED_SONGS_KEY);
  return data ? JSON.parse(data) : [];
};

const getDeletedSongs = (): string[] => {
  const data = localStorage.getItem(DELETED_SONGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const handlers = [
  // Intercept the iTunes search API to merge live data with MSW state
  http.get('https://itunes.apple.com/search', async ({ request }) => {
    try {
      const realResponse = await fetch(bypass(request));
      if (!realResponse.ok) {
        throw new Error('iTunes API failed');
      }
      const data = await realResponse.json();

      // Map iTunes response keys to our clean Song interface
      const itunesSongs: Song[] = (data.results || []).map((item: {
        trackId: number;
        trackName?: string;
        artistName?: string;
        collectionName?: string;
        releaseDate?: string;
        artworkUrl100?: string;
      }) => ({
        id: String(item.trackId),
        title: item.trackName || 'Unknown Title',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Unknown Album',
        year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2000,
        coverUrl: item.artworkUrl100 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop&q=80',
      }));

      const added = getAddedSongs();
      const deleted = getDeletedSongs();

      const mergedSongs = [...added, ...itunesSongs].filter(
        (song) => !deleted.includes(song.id)
      );

      return HttpResponse.json({ results: mergedSongs });
    } catch (error) {
      console.error('MSW Handler error fetching iTunes, falling back to local state:', error);
      const added = getAddedSongs();
      return HttpResponse.json({ results: added, isFallback: true });
    }
  }),

  // POST /songs to add a song to our MSW mock database
  http.post('/songs', async ({ request }) => {
    const body = (await request.json()) as Omit<Song, 'id' | 'coverUrl'>;

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: body.title,
      artist: body.artist,
      album: body.album,
      year: Number(body.year),
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop&q=80',
    };

    const added = getAddedSongs();
    added.unshift(newSong);
    localStorage.setItem(ADDED_SONGS_KEY, JSON.stringify(added));

    return HttpResponse.json(newSong, { status: 201 });
  }),

  // DELETE /songs/:id to remove or mark a song as deleted
  http.delete('/songs/:id', ({ params }) => {
    const { id } = params;
    const idStr = String(id);

    const added = getAddedSongs();
    const index = added.findIndex((s) => s.id === idStr);

    if (index > -1) {
      added.splice(index, 1);
      localStorage.setItem(ADDED_SONGS_KEY, JSON.stringify(added));
    } else {
      const deleted = getDeletedSongs();
      if (!deleted.includes(idStr)) {
        deleted.push(idStr);
        localStorage.setItem(DELETED_SONGS_KEY, JSON.stringify(deleted));
      }
    }

    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
