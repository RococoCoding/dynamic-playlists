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

export interface Slot {
  id: string;
  created_at: Date;
  last_updated?: Date;
  name: string; 
  artist_name?: string[];
  playlist_id: string;
  pool_id?: string;
  type: number;
}
