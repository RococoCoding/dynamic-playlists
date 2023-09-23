import { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PublishIcon from '@mui/icons-material/Publish';

import ListItem from './presentational/ListItem';
import { SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME } from '../constants';
import callApi from '../utils/callApi';
import { BaseSlot, FullSlot, PlaylistType, PoolTrack, SearchResultOption, SpotifyAlbumType, SpotifyEntry } from '../types/index.js';
import BaseDialog from './forms/BaseDialog';
import EditSlot from './forms/EditSlot';
import { requiresArtist } from '../utils';
import useSpotifyApi from '../utils/useSpotifyApi';
import { useTokenContext } from '../contexts/token';
import { useUserContext } from '../contexts/user';

const iconTypeMapping = {
  [SLOT_TYPES_MAP_BY_NAME.track]: <AudiotrackIcon />,
  [SLOT_TYPES_MAP_BY_NAME.album]: <AlbumIcon />,
  [SLOT_TYPES_MAP_BY_NAME.artist]: <PersonIcon />,
  [SLOT_TYPES_MAP_BY_NAME.playlist]: <QueueMusicIcon />,
}

const ListHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

const ListTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: 'white',
});

const PlaylistActionButton = styled(Button)({
  marginBottom: '15px',
});

const PlaylistActionsContainer = styled('div')({
  display: 'flex',
  width: '140px',
  justifyContent: 'space-between',
});

const SlotInnerContent = styled('div')({
  display: 'flex',
  flexGrow: '1',
  '@media (max-width:600px)': {
    width: '87%',
  },
});

type Props = {
  playlist: PlaylistType;
  setApiError: (error: string) => void;
}

const pickRandomTrack = (pool: PoolTrack[]) => {
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function Playlist({
  playlist,
  setApiError
}: Props) {
  const [slots, setSlots] = useState<FullSlot[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SpotifyEntry | null>(null);
  const [openEditSlotDialog, setOpenEditSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<FullSlot>();
  const [selectedOption, setSelectedOption] = useState<SearchResultOption | null>(null);
  const [slotType, setSlotType] = useState(selectedSlot?.type ? SLOT_TYPES_MAP_BY_ID[selectedSlot.type] : '');
  const editMode = !!selectedSlot;
  const { currToken } = useTokenContext();
  const { userId } = useUserContext();
  const { callSpotifyApi } = useSpotifyApi();

  const openCreateSlotForm = () => {
    setOpenEditSlotDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditSlotDialog(false);
  };

  const clearState = () => {
    setSelectedSlot(undefined);
    setSelectedEntry(null);
    setSelectedOption(null);
  }

  const getAlbumTracks = async (spotifyId: string): Promise<Array<PoolTrack> | undefined> => {
    // TODO: rework pools
    // if (poolNeedsUpdating) {
    const input = {
      method: 'GET',
      path: `albums/${spotifyId}/tracks`,
      token: currToken,
    }
    const { errorMsg, data } = await callSpotifyApi(input);
    if (!errorMsg && data) {
      const tracks = data.items.map(({ id, name, artists }: SpotifyAlbumType) => ({
        // pool_id: poolId,
        name,
        spotify_track_id: id,
        spotify_artist_ids: artists.map((artist: any) => artist.id)
      }));
      // save tracks to pool
      // console.log('saving tracks to pool');
      // await callApi({
      //   method: 'POST',
      //   path: `pool-tracks/by-pool/${poolId}`,
      //   data: tracks,
      // });
      return tracks;
    } else {
      console.log('Could not retrieve tracks from spotify', errorMsg)
      console.log('callSpotifyApi input', input)
    }
    // }
    // const input = {
    //   method: 'GET',
    //   path: `pool-tracks/by-pool/${poolId}`,
    //   token: currToken,
    // }
    // const { errorMsg, data } = await callApi(input);
    // if (!errorMsg && data) {
    //   return data;
    // } else {
    //   console.log('Could not retrieve tracks from db', errorMsg)
    //   console.log('callApi input', input)A
    // }
  }

  const publishPlaylist = async () => {
    let spotifyPlaylistId = playlist.spotify_id;
    // if playlist has never been published before, create new playlist in spotify
    // TODO: support descriptions
    // TODO: support private playlists
    if (!spotifyPlaylistId) {
      // spotify api call to create a new empty playlist
      const { errorMsg, data } = await callSpotifyApi({
        method: 'POST',
        path: `users/${userId}/playlists`,
        token: currToken,
        data: {
          name: playlist.title,
        }
      });
      if (errorMsg) {
        console.log('Error creating playlist in Spotify', errorMsg);
        return;
      }
      const { id: newSpotifyPlaylistId } = data;

      // save spotify playlist id to playlist in dp db
      const { errorMsg: errorMsg2 } = await callApi({
        method: 'PUT',
        path: `playlists/${playlist.id}`,
        data: {
          spotify_id: newSpotifyPlaylistId,
          last_updated_by: userId,
        }
      });
      if (errorMsg2) {
        console.log('Error saving spotify playlist id to playlist in db', errorMsg2);
        return;
      } else {
        spotifyPlaylistId = newSpotifyPlaylistId;
      }
    } else {
      // clear existing playlist in spotify
      const { errorMsg } = await callSpotifyApi({
        method: 'PUT',
        path: `playlists/${spotifyPlaylistId}/tracks`,
        token: currToken,
        data: {
          uris: [],
        }
      });
      if (errorMsg) {
        console.log('Error clearing playlist in Spotify', errorMsg);
        return;
      };
    }

    // update spotify playlist with current slots
    // convert each slot to a spotify uri of a track
    const uris = await Promise.all(slots.map(async (slot) => {
      const { type, name, pool_id, pool_spotify_id } = slot;
      // TODO: figure out if this is timing I want for updating
      // const poolNeedsUpdating = !pool_last_updated || new Date(pool_last_updated) < new Date(playlist.last_updated);
      switch (type) {
        case SLOT_TYPES_MAP_BY_NAME.track:
          return `spotify:track:${pool_spotify_id}`;
        case SLOT_TYPES_MAP_BY_NAME.album:
          if (!pool_id || !pool_spotify_id) {
            console.log('Expected pool_id & pool_spotify_id for album slot')
            return;
          }
          // get album tracks
          const albumTracks = await getAlbumTracks(pool_spotify_id);
          if (albumTracks) {
            // pick a track
            const track = pickRandomTrack(albumTracks);
            if (track) {
              return `spotify:track:${track.spotify_track_id}`;
            }
          }
          console.log('No uri added for album slot: ', slot.id, ' name: ', name, ' spotify id: ', pool_spotify_id);
          break;
        case SLOT_TYPES_MAP_BY_NAME.artist:
          if (!pool_id || !pool_spotify_id) {
            console.log('Expected pool_id & pool_spotify_id for artist slot')
            return;
          }
          // get artist albums
          const { errorMsg, data } = await callSpotifyApi({
            method: 'GET',
            path: `artists/${pool_spotify_id}/albums`,
            token: currToken,
          });
          if (errorMsg) {
            console.log('Error clearing playlist in Spotify', errorMsg);
            return;
          }
          const { items } = data;
          // get tracks from each album
          const allTracks = (await Promise.all(items.map(async (album: any) => getAlbumTracks(album.id)))).flat();
          if (allTracks.length) {
            // pick a track
            const track = pickRandomTrack(allTracks);
            if (track) {
              return `spotify:track:${track.spotify_track_id}`;
            }
          }
          console.log('No uri added for artist slot: ', slot.id, ' name: ', ' spotify id: ', pool_spotify_id);
          break;
        default: console.log('Unexpected slot type', type);
        // copilot just threw this in. Will check it later when I implement playlist support
        // case SLOT_TYPES_MAP_BY_NAME.playlist:
        //   // get playlist tracks
        //   const { errorMsg: errorMsg2, data: data2 } = await callSpotifyApi({
        //     method: 'GET',
        //     path: `playlists/${pool_spotify_id}/tracks`,
        //     token: currToken,
        //   });
        //   if (errorMsg2) {
        //     console.log('Error clearing playlist in Spotify', errorMsg2);
        //     return;
        //   }
        //   const { items: playlistTracks } = data2;
        //   // save playlist tracks to pool
        //   await callApi({
        //     method: 'POST',
        //     path: 'pool-tracks/',
        //     data: playlistTracks.map(({ track }: any) => ({
        //       pool_id,
      }
    }));
    // remove undefined uris
    const filteredUris = uris.filter((uri, index) => {
      if (!uri) {
        console.log('undefined uri at index ', index);
      }
      return !!uri;
    });
    // update spotify playlist with selected tracks
    const { errorMsg } = await callSpotifyApi({
      method: 'PUT',
      path: `playlists/${spotifyPlaylistId}/tracks`,
      token: currToken,
      data: {
        uris: filteredUris,
      }
    });
    if (errorMsg) {
      console.log('Error updating playlist in Spotify', errorMsg);
    }
  }  

  const selectSlotToEdit = (id: string) => {
    const slot = slots.find((slot) => slot.id === id);
    if (slot) {
      const option = {
        label: `${slot.name}${slot.artist_name ? ` - ${slot.artist_name[0]}` : ''}`,
        value: slot.pool_spotify_id,
      }
      setSelectedSlot(slot);
      setSelectedOption(option);
      setSlotType(slot?.type ? SLOT_TYPES_MAP_BY_ID[slot.type] : '');
      setOpenEditSlotDialog(true);
    }
  }

  const handleEditSlotSubmit = async () => {
    if (selectedEntry) {
      const newSlot: BaseSlot = {
        name: selectedEntry.name,
        type: SLOT_TYPES_MAP_BY_NAME[slotType],
        position: slots.length,
      }
      if ('artists' in selectedEntry) {
        newSlot.artist_name = selectedEntry.artists.map((artist) => artist.name);
      } else if ('owner' in selectedEntry) {
        newSlot.artist_name = [selectedEntry.owner.display_name];
      }
      if (editMode) {
        newSlot.position = selectedSlot.position;
      }
      const { errorMsg, data: returnedSlot } = await callApi({
        method: editMode ? 'PUT' : 'POST',
        path: editMode ? `slots/${selectedSlot.id}` : 'slots',
        data: {
          ...newSlot,
          playlist_id: playlist.id,
          spotify_id: selectedEntry.id,
        }
      });
      if (errorMsg) {
        setApiError(errorMsg);
      } else {
        const newSlots = [...slots];
        if (editMode) {
          newSlots.splice(returnedSlot.position, 1, returnedSlot);
        } else {
          newSlots.push(returnedSlot);
        }
        setSlots(newSlots);
        clearState();
      }
      handleDialogClose();
    }
  }

  const EditSlotDialogContent = (
    <EditSlot
      createMode={!selectedSlot}
      slotType={slotType}
      selectedSlot={selectedSlot}
      selectedOption={selectedOption}
      setSlotType={setSlotType}
      setSelectedEntry={setSelectedEntry}
      setSelectedOption={setSelectedOption}
    />
  )

  useEffect(() => {

    async function getPlaylist() {
      const { errorMsg, data } = await callApi({
        method: 'GET',
        path: `slots/by-playlist/${playlist.id}`
      });
      if (errorMsg) {
        console.error(errorMsg);
      } else {
        setSlots(data.sort(({ position }: FullSlot, { position: position2 }: FullSlot) => position - position2));
      }
    }

    getPlaylist();

  }, [playlist.id]);

  return (
    <>
      <ListHeader>
        <ListTitle>{playlist.title}</ListTitle>
        <PlaylistActionsContainer>
          <PlaylistActionButton variant="contained" onClick={openCreateSlotForm}>
            <AddIcon />
          </PlaylistActionButton>
          <PlaylistActionButton variant="contained" onClick={publishPlaylist}>
            <PublishIcon />
          </PlaylistActionButton>
        </PlaylistActionsContainer>
      </ListHeader>
      {slots.map(slot => {
        const label = slot.name + (requiresArtist(slot.type) && slot.artist_name?.length ? ' - ' + slot.artist_name.join(', ') : '')
        const innerContent = (
          <SlotInnerContent>
            <div className="scroll-container" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', width: '80%', flexGrow: '1' }}>
              <div className={label.length > 24 ? "scroll-content" : ""} style={{ fontSize: '1rem' }}>
                {label}
              </div>
            </div>
            <EditIcon style={{ marginRight: '5px' }} onClick={() => selectSlotToEdit(slot.id)} />
          </SlotInnerContent>
        );
        return (
          <ListItem
            key={slot.id}
            id={slot.id}
            icon={iconTypeMapping[slot.type]}
            innerContent={innerContent}
          />
        )
      })
      }
      {
        openEditSlotDialog &&
        <BaseDialog
          dialogContent={EditSlotDialogContent}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleEditSlotSubmit}
          isDialogOpen={openEditSlotDialog}
          submitDisabled={false} // TODO: add validation
          fullWidth={true}
          submitText={selectedSlot ? 'Edit' : 'Create'}
        />
      }
    </>
  );
}

export default Playlist;
