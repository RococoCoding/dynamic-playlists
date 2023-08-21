import { useState } from "react";
import { BaseSlot, FullSlot } from "../../types";
import styled from "@emotion/styled";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { SLOT_TYPES, SLOT_TYPES_MAP_BY_ID } from "../../constants";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import SpotifySearch from "./inputs/SpotifySearch";

type Props = {
  existingSlot?: FullSlot | BaseSlot;
}

function EditSlot({
  existingSlot,
}: Props) {
  // set as string name here, but save as integer id when submitting
  // - dropdown input converts to value to string
  // - need string name for Spotify API call to set type in search
  const [slotType, setSlotType] = useState(existingSlot?.type ? SLOT_TYPES_MAP_BY_ID[existingSlot.type] : '');
  const [slot, setSlot] = useState(existingSlot || null);
  const StyledDialogTitle = styled(DialogTitle)({
    backgroundColor: '#282c34',
    color: 'white',
  });

  const StyledDialogContent = styled(DialogContent)({
    backgroundColor: '#282c34',
  });



  return (
    <>
      <StyledDialogTitle>{existingSlot ? 'Edit Slot' : 'Create a new slot'}</StyledDialogTitle>
      <StyledDialogContent>
        <InputLabel>Slot Type</InputLabel>
        <Select
          fullWidth
          sx={{
            input: {
              color: 'white',
              backgroundColor: 'black'
            },
          }}
          color='primary'
          value={slotType}
          onChange={(event: SelectChangeEvent) => setSlotType(event.target.value)}
        >
          {SLOT_TYPES.map((slotType) => {
            return (
              <MenuItem key={slotType} value={slotType}>{slotType}</MenuItem>
            )
          })}
        </Select>
        {
          slotType &&
          <SpotifySearch
            setSlot={setSlot}
            slotType={slotType}
          />
        }
      </StyledDialogContent>
    </>
  )
}

export default EditSlot;