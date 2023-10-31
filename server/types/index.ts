import { UUID } from "crypto";
import { VALID_SLOT_TYPES } from "../constants";
import { Response as ExpressResponse } from "express";
import { JwtPayload } from "jsonwebtoken";

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
}

export type SlotType = typeof VALID_SLOT_TYPES[number];

export interface Slot {
  id: UUID;
  artist_name: string[];
  created_at: Date;
  current_track?: string;
  last_updated: Date;
  name: string;
  playlist_id: UUID;
  pool_id?: UUID;
  position: number;
  type: SlotType;
}

export interface PoolTrack {
  id: UUID;
  pool_id: UUID;
  spotify_track_id: string;
  spotify_artist_ids?: Array<string>; // For future feature of banning artists
}

export interface PlaylistWithSlots extends Playlist {
  slots?: Array<Slot>;
}

export interface AuthResponse extends ExpressResponse {
  locals: {
    username?: string;
    token?: string | JwtPayload;
  };
}
