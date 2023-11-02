import { FullSlot, BaseSlot } from "../types";
import callApi from "./callApi";

export const editOrCreateSlot = async ({
  editMode,
  newSlot,
  playlistId,
  slotToEditId,
  selectedEntryId,
}: {
  editMode: boolean;
  newSlot: FullSlot | BaseSlot;
  playlistId: string;
  slotToEditId?: string;
  selectedEntryId: string;
}): Promise<FullSlot> => {
  const { data } = await callApi({
    method: editMode ? 'PUT' : 'POST',
    path: editMode ? `slots/${slotToEditId}` : 'slots',
    data: {
      ...newSlot,
      playlist_id: playlistId,
      spotify_id: selectedEntryId,
    }
  });
  return data;
}

export const deleteSlot = async (slotId: string): Promise<Array<FullSlot>> => {
  // deletes a slot and returns all remaining slots for the playlist
  const { data: slots } = await callApi({
    method: 'DELETE',
    path: `slots/${slotId}?return_all=true`,
  });
  slots.sort(({ position }: FullSlot, { position: position2 }: FullSlot) => position - position2)
  return slots;
}

export const getSlotsByPlaylistId = async (playlistId: string): Promise<Array<FullSlot>> => {
  const { data: slots } = await callApi({
    method: 'GET',
    path: `slots/by-playlist/${playlistId}`
  });
  const sorted = sortSlots(slots);
  return sorted;
}

export const sortSlots = (slots: Array<FullSlot>) => slots.sort(({ position }: FullSlot, { position: position2 }: FullSlot) => position - position2)


export const updateSlotWithNewTrack = async (slotId: string, trackId: string):Promise<FullSlot> => {
  const { data } = await callApi({
    method: 'PUT',
    path: `slots/${slotId}`,
    data: {
      current_track: trackId,
    }
  });
  return data;
}

export const updateAllSlots = async (
  slots: Array<FullSlot>,
  playlistId?: string,
): Promise<Array<FullSlot>> => {
  const { data } = await callApi({
    method: 'PUT',
    path: `slots/by-playlist/${playlistId}`,
    data: {
      slots,
    }
  });
  return data;
};
