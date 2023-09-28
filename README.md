Dynamic Playlists (Under Development)

Major TODOS before release:
- Publish a playlist to spotify (🔨🚧🏗️)
- Update playlist with new tracks during listening through DP app
- Scrolling for longer playlists
- Support drag n drop for slot positioning
- Delete slots
- Spotify attributions & branding guidelines
- Global snackbar to handle API error messages
- Testing
- Refactor pools

Misc Todos:
- add switch to web playback button
- shuffle
- 

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
