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
  playlist_id: string;
  pool_id?: string;
}

export interface BaseSlot {
  name: string; 
  artist_name?: string[];
  type: keyof typeof SLOT_TYPES_MAP_BY_ID;
  position: number;
}
