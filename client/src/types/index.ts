import { SLOT_TYPES_MAP_BY_ID } from "../constants";

export type User = {
  id: string;
}

export interface PlaylistType {
  id: string;
  spotify_id?: string;
  created_at: string;
  created_by: string;
  last_updated: string;
  last_updated_by: string;
  title: string;
}

export interface PlaylistWithSlots extends PlaylistType {
  slots: Array<FullSlot>;
}

export interface FullSlot extends BaseSlot {
  id: string;
  created_at: string;
  current_track?: string; // spotify id
  last_updated?: string;
  pool_id?: string;
  pool_spotify_id: string;
  pool_last_updated: string;
  playlist_id: string;
}

export interface BaseSlot {
  name: string; 
  artist_name?: string[];
  type: keyof typeof SLOT_TYPES_MAP_BY_ID;
  position: number;
}


export type SpotifyArtistType = {
  id: string;
  name: string;
}

export type SpotifyAlbumType = {
  id: string;
  name: string;
  artists: Array<SpotifyArtistType>;
  album_group: string;
}

export type SpotifyPlaylistType = {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  owner: { display_name: string };
  snapshot_id: string;
}

export type SpotifyTrackType = {
  id: string;
  album: SpotifyAlbumType;
  artists: Array<SpotifyArtistType>;
  name: string;
  uri: string;
}

export type SpotifyEntry = SpotifyArtistType | SpotifyAlbumType | SpotifyPlaylistType | SpotifyTrackType

export type SpotifyUser = {
  email: string;
  display_name: string;
  country: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  }
  id: string;
  images: Array<{ url: string }>;
}

export type SearchResultOption = {
  label: string;
  imageUrl?: string;
  value: string;
  altText?: string;
}

export type PoolTrack = {
  id: string;
  pool_id: string;
  spotify_track_id: string;
  spotify_artist_ids?: Array<string>;
}

export type SeverityLevel = 'success' | 'error' | 'warning' | 'info';
