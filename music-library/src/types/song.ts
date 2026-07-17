export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  coverUrl: string;
}

export interface SongFormData {
  title: string;
  artist: string;
  album: string;
  year: number;
}
