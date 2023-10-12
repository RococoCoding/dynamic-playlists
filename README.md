# Dynamic Playlists

### 🚧 Under Development 🚧
<details>
<summary>TODOs before release</summary>

- Big
  - Testing
  - Spotify attributions & branding guidelines
  - complete landing page
  - deploy + ci/cd
- Med
  - finish error boundaries
  - Support drag n drop for slot positioning
  - separate playlist route so refresh doesn't take you away to home + back button to home
    - also refresh selected playlist after publishing for the first time so it doesn't create multiple new playlists
  - Styling on mobile (icons taking up too much space)
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
- Smol
  - tooltips for buttons
  - Scrolling for longer playlists + remove scroll for playlist items
  - Play a specific track in a playlist
  - header nav
  - delete account
  - Are you sure? on delete list / slot

Misc Todos:
- Refactor pools
- add switch to web playback button
- shuffle
- submit feedback form
- bugfix: handle key error when adding two of identical slots
- figure out redirect using router-dom

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
