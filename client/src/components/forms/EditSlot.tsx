import { SearchResultOption, SpotifyEntry } from "../../types";
import styled from "@emotion/styled";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { SLOT_TYPES, SLOT_TYPES_MAP_BY_NAME } from "../../constants";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import SpotifySearch from "./inputs/SpotifySearch";

type Props = {
  selectedOption: SearchResultOption | null;
  setSelectedOption: (option: SearchResultOption | null) => void;
  setSelectedEntry: (entry: SpotifyEntry | null) => void;
  slotType: keyof typeof SLOT_TYPES_MAP_BY_NAME;
  setSlotType: (slotType: keyof typeof SLOT_TYPES_MAP_BY_NAME) => void;
  createMode?: boolean;
}

function EditSlot({
  createMode = false,
  selectedOption,
  setSelectedOption,
  setSelectedEntry,
  slotType,
  setSlotType,
}: Props) {
  // set as string name here, but save as integer id when submitting
  // - dropdown input converts to value to string
  // - need string name for Spotify API call to set type in search
  const StyledDialogTitle = styled(DialogTitle)({
    backgroundColor: '#282c34',
    color: 'white',
  });

  const StyledDialogContent = styled(DialogContent)({
    backgroundColor: '#282c34',
  });

  const handleSelect = (value: string) => {
    setSlotType(value)
    setSelectedEntry(null);
  }

  return (
    <>
      <StyledDialogTitle>{createMode ? 'Edit Slot' : 'Create a new slot'}</StyledDialogTitle>
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
          style={{ marginBottom: '5px' }}
          color='primary'
          value={slotType}
          onChange={(event: SelectChangeEvent) => handleSelect(event.target.value)}
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
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            setSelectedEntry={setSelectedEntry}
            slotType={slotType}
          />
        }
      </StyledDialogContent>
    </>
  )
}

export default EditSlot;