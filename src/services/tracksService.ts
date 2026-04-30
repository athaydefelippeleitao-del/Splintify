import { supabase } from '../lib/supabase';
import { Track, Artist, Category, Playlist } from '../types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function mapTrack(row: Record<string, unknown>): Track {
  return {
    id: row.id as string,
    title: row.title as string,
    artist: row.artist as string,
    album: (row.album as string) ?? '',
    cover: (row.cover as string) ?? '',
    duration: (row.duration as number) ?? 0,
    genre: (row.genre as string) ?? '',
    isHit: (row.is_hit as boolean) ?? false,
    audioUrl: (row.audio_url as string) ?? undefined,
  };
}

function mapArtist(row: Record<string, unknown>): Artist {
  return {
    id: row.id as string,
    name: row.name as string,
    genre: (row.genre as string) ?? '',
    photo: (row.photo as string) ?? '',
    bio: (row.bio as string) ?? undefined,
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    color: (row.color as string) ?? '#22c55e',
  };
}

function mapPlaylist(row: Record<string, unknown>): Playlist {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    cover: (row.cover as string) ?? '',
    tracks: (row.tracks as Track[]) ?? [],
  };
}

// ─────────────────────────────────────────────
// Tracks
// ─────────────────────────────────────────────

export function subscribeToTracks(onTracks: (tracks: Track[]) => void): () => void {
  // Fetch inicial
  supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) { console.error('[Supabase] tracks fetch:', error.message); return; }
      onTracks((data ?? []).map(mapTrack));
    });

  // Realtime subscription
  const channel = supabase
    .channel('tracks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, async () => {
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });
      onTracks((data ?? []).map(mapTrack));
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addTrack(track: Omit<Track, 'id'>): Promise<void> {
  const { error } = await supabase.from('tracks').insert({
    title: track.title,
    artist: track.artist,
    album: track.album,
    cover: track.cover,
    duration: track.duration,
    genre: track.genre,
    is_hit: track.isHit ?? false,
    audio_url: track.audioUrl ?? null,
  });
  if (error) throw new Error(`[Supabase] addTrack: ${error.message}`);
}

export async function updateTrack(id: string, track: Partial<Track>): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (track.title !== undefined) payload.title = track.title;
  if (track.artist !== undefined) payload.artist = track.artist;
  if (track.album !== undefined) payload.album = track.album;
  if (track.cover !== undefined) payload.cover = track.cover;
  if (track.duration !== undefined) payload.duration = track.duration;
  if (track.genre !== undefined) payload.genre = track.genre;
  if (track.isHit !== undefined) payload.is_hit = track.isHit;
  if (track.audioUrl !== undefined) payload.audio_url = track.audioUrl;

  const { error } = await supabase.from('tracks').update(payload).eq('id', id);
  if (error) throw new Error(`[Supabase] updateTrack: ${error.message}`);
}

export async function deleteTrack(id: string): Promise<void> {
  const { error } = await supabase.from('tracks').delete().eq('id', id);
  if (error) throw new Error(`[Supabase] deleteTrack: ${error.message}`);
}

// ─────────────────────────────────────────────
// Artists
// ─────────────────────────────────────────────

export function subscribeToArtists(onArtists: (artists: Artist[]) => void): () => void {
  supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true })
    .then(({ data, error }) => {
      if (error) { console.error('[Supabase] artists fetch:', error.message); return; }
      onArtists((data ?? []).map(mapArtist));
    });

  const channel = supabase
    .channel('artists-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'artists' }, async () => {
      const { data } = await supabase.from('artists').select('*').order('name', { ascending: true });
      onArtists((data ?? []).map(mapArtist));
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addArtist(artist: Omit<Artist, 'id'>): Promise<void> {
  const { error } = await supabase.from('artists').insert({
    name: artist.name,
    genre: artist.genre,
    photo: artist.photo,
    bio: artist.bio ?? null,
  });
  if (error) throw new Error(`[Supabase] addArtist: ${error.message}`);
}

export async function updateArtist(id: string, artist: Partial<Artist>): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (artist.name !== undefined) payload.name = artist.name;
  if (artist.genre !== undefined) payload.genre = artist.genre;
  if (artist.photo !== undefined) payload.photo = artist.photo;
  if (artist.bio !== undefined) payload.bio = artist.bio;

  const { error } = await supabase.from('artists').update(payload).eq('id', id);
  if (error) throw new Error(`[Supabase] updateArtist: ${error.message}`);
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase.from('artists').delete().eq('id', id);
  if (error) throw new Error(`[Supabase] deleteArtist: ${error.message}`);
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export function subscribeToCategories(onCategories: (categories: Category[]) => void): () => void {
  supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
    .then(({ data, error }) => {
      if (error) { console.error('[Supabase] categories fetch:', error.message); return; }
      onCategories((data ?? []).map(mapCategory));
    });

  const channel = supabase
    .channel('categories-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      onCategories((data ?? []).map(mapCategory));
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    name: category.name,
    color: category.color,
  });
  if (error) throw new Error(`[Supabase] addCategory: ${error.message}`);
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (category.name !== undefined) payload.name = category.name;
  if (category.color !== undefined) payload.color = category.color;

  const { error } = await supabase.from('categories').update(payload).eq('id', id);
  if (error) throw new Error(`[Supabase] updateCategory: ${error.message}`);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(`[Supabase] deleteCategory: ${error.message}`);
}

// ─────────────────────────────────────────────
// Playlists
// ─────────────────────────────────────────────

export function subscribeToPlaylists(uid: string, onPlaylists: (playlists: Playlist[]) => void): () => void {
  const fetch = async () => {
    const { data: plRows, error } = await supabase
      .from('playlists')
      .select('*, playlist_tracks(track_id, position, tracks(*))')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false });

    if (error) { console.error('[Supabase] playlists fetch:', error.message); return; }

    const playlists: Playlist[] = (plRows ?? []).map((row) => {
      const trackRows = (row.playlist_tracks ?? []) as Array<{ track_id: string; position: number; tracks: Record<string, unknown> }>;
      const tracks = trackRows
        .sort((a, b) => a.position - b.position)
        .map((pt) => mapTrack(pt.tracks));
      return { ...mapPlaylist(row), tracks };
    });

    onPlaylists(playlists);
  };

  fetch();

  const channel = supabase
    .channel(`playlists-changes-${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists', filter: `user_id=eq.${uid}` }, fetch)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist_tracks' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addPlaylist(playlist: Omit<Playlist, 'id'> & { userId: string }): Promise<string | null> {
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name: playlist.name,
      description: playlist.description,
      cover: playlist.cover,
      user_id: playlist.userId,
    })
    .select('id')
    .single();

  if (error) throw new Error(`[Supabase] addPlaylist: ${error.message}`);
  return data?.id ?? null;
}

export async function updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (playlist.name !== undefined) payload.name = playlist.name;
  if (playlist.description !== undefined) payload.description = playlist.description;
  if (playlist.cover !== undefined) payload.cover = playlist.cover;

  const { error } = await supabase.from('playlists').update(payload).eq('id', id);
  if (error) throw new Error(`[Supabase] updatePlaylist: ${error.message}`);
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from('playlists').delete().eq('id', id);
  if (error) throw new Error(`[Supabase] deletePlaylist: ${error.message}`);
}

export async function addTrackToPlaylistDb(playlistId: string, trackId: string, position: number = 0): Promise<void> {
  const { error } = await supabase
    .from('playlist_tracks')
    .upsert({ playlist_id: playlistId, track_id: trackId, position }, { onConflict: 'playlist_id,track_id' });
  if (error) throw new Error(`[Supabase] addTrackToPlaylist: ${error.message}`);
}

export async function removeTrackFromPlaylistDb(playlistId: string, trackId: string): Promise<void> {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);
  if (error) throw new Error(`[Supabase] removeTrackFromPlaylist: ${error.message}`);
}

// ─────────────────────────────────────────────
// Admins
// ─────────────────────────────────────────────

export async function checkIfAdmin(uid: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] checkIfAdmin:', error.message);
      return false;
    }
    return !!data;
  } catch {
    return false;
  }
}
