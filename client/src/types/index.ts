export type User = {
  id: string;
}

export interface Playlist {
  id: string;
  spotify_id?: string;
  created_at: Date;
  created_by: string;
  last_updated: Date;
  last_updated_by: string;
  title: string;
}
