export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number; // in seconds
  genre: string;
  isHit?: boolean;
  audioUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  photo: string;
  bio?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: Track[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Folder {
  id: string;
  name: string;
  playlistIds: string[];
}
