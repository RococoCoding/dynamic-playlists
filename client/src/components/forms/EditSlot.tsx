import { useState } from "react";
import { BaseSlot, FullSlot } from "../../types";
import styled from "@emotion/styled";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { SLOT_TYPES, SLOT_TYPES_MAP } from "../../constants";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

type Props = {
  existingSlot?: FullSlot | BaseSlot;
}

function EditSlot({
  existingSlot,
}: Props) {
  // saving slotType as string because I didn't want to fight with the select input converting the values to strings
  // just need to remember to convert to int when saving the slot
  const [slotType, setSlotType] = useState(`${existingSlot?.type}` || '');
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
          // autoFocus
          // margin="dense"
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
            console.log(slotType)
            return (
              <MenuItem key={slotType} value={SLOT_TYPES_MAP[slotType]}>{slotType}</MenuItem>
            )
          })}
        </Select>
      </StyledDialogContent>
    </>
  )
}

export default EditSlot;