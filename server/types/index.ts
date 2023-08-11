import { UUID } from "crypto";
import { VALID_SLOT_TYPES } from "../constants";

export interface Playlist {
  id: UUID;
  spotify_id?: string;
  created_at: Date;
  created_by: string;
  last_updated: Date;
  last_updated_by: string;
  title: string;
}

export type Pool = {
  id: UUID;
  last_updated: Date;
  spotify_id: string;
  market: string;
}

export type SlotType = typeof VALID_SLOT_TYPES[number];

export interface Slot {
  id: UUID;
  created_at: Date;
  last_updated: Date;
  name: string;
  playlist_id: UUID;
  pool_id?: UUID;
  type: SlotType;
}

export interface PoolTrack {
  id: UUID;
  pool_id: UUID;
  spotify_track_id: string;
  spotify_artist_id: string;
}
