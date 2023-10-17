# Dynamic Playlists

### 🚧 Under Development 🚧
<details>
<summary>TODOs</summary>

- Big
  - Testing
  - Spotify attributions & branding guidelines
  - complete landing page
  - deploy + ci/cd
- Med
  - finish error boundaries
  - Support drag n drop for slot positioning
  - Styling on mobile (icons taking up too much space)
  - bugfix: handle key error when adding two of identical slots
  - <details>
      <summary>bugfix: auto update positions when deleting slots</summary>
        copilot spit this out, investigate it  
        ```sql
          CREATE OR REPLACE FUNCTION update_slot_positions()
          RETURNS TRIGGER AS $$
          BEGIN
            UPDATE slots
            SET position = position - 1
            WHERE playlistid = OLD.playlistid AND position > OLD.position;
            RETURN OLD;
          END;
          $$ LANGUAGE plpgsql;
          CREATE TRIGGER update_slot_positions_trigger
          AFTER DELETE ON slots
          FOR EACH ROW
          EXECUTE FUNCTION update_slot_positions();
        ```
    </details>
  - add import playlist
- Smol
  - tooltips for buttons
  - Scrolling for longer playlists + remove scroll for playlist items
  - Play a specific track in a playlist
  - header nav
  - delete account
  - Are you sure? on delete list / slot

Follow-up Todos:
- Figure out a better solution for getting out of sync with spotify version of the playlist?
- Refactor pools
- add switch to web playback button
- shuffle & loop controls
- delete spotify playlist
- submit feedback form
- bugifx: "The value provided to Autocomplete is invalid. None of the options match..." error & odd behavior
- Filters for artist/album/playlist pools
  - exclude compliation albums (default)
  - exclude live/best of albums
  - custom filters (remove songs from pool individually -- gotta think through how this works with updating pools)
- webplayback progress bar for position in song

</details>

### Description
A Spotify web player where you can design dynamic playlists that autorefresh with new songs as you listen.
In a dynamic playlist you can add tracks, which behave normally, or slots, which will rotate between songs from a selection of songs as you listen. Slots can be populated with artists, albums, or playlists. (Support for recommendations is planned but will not be in the initial release.)

Example: 
List:
1. Track - "Stained Glass" by Danny Schmidt (plays "Stained Glass" each loop)
2. Slot - Artist - Hozier (plays a new random song from Hozier's catalog each loop)
3. Slot - Playlist - Halloween Party (plays a new random song from Halloween Party each loop)

Loop 1
1. "Stained Glass"
2. "Take Me to Church"
3. "Thriller"

Loop 2
1. "Stained Glass"
2. "Angel of Small Death and the Codeine Scene"
3. "Witch Doctor"
