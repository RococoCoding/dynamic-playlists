import { SLOT_TYPES_MAP_BY_ID } from "../constants";

export type User = {
  id: string;
}

export interface PlaylistType {
  id: string;
  spotify_id?: string;
  created_at: Date;
  created_by: string;
  last_updated: Date;
  last_updated_by: string;
  title: string;
}

export interface FullSlot extends BaseSlot {
  id: string;
  created_at: Date;
  last_updated?: Date;
  pool_id?: string;
  pool_spotify_id: string;
  pool_last_updated: Date;
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
}

export type SpotifyPlaylistsType = {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  owner: { display_name: string };
}

export type SpotifyTrackType = {
  id: string;
  album: SpotifyAlbumType;
  artists: Array<SpotifyArtistType>;
  name: string;
}


export type SpotifyEntry = SpotifyArtistType | SpotifyAlbumType | SpotifyPlaylistsType | SpotifyTrackType

export type SearchResultOption = {
  label: string;
  imageUrl?: string;
  value: string;
  altText?: string;
}
