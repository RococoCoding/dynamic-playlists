import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { FullSlot, BaseSlot } from '../../../types';
import callSpotifyApi from '../../../utils/callSpotifyApi';
import { useTokenContext } from '../../../contexts/token';
import { SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE } from '../../../constants';

type Props = {
  setSlot: (slot: FullSlot | BaseSlot) => void;
  slotType: string;
}

function SearchInput({ setSlot, slotType }: Props) {
  const { token } = useTokenContext();
  const [results, setResults] = useState<any[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [textInputValue, setTextInputValue] = useState<string>('');

  const handleSelect = (value: string | null) => {
    console.log('selected', value);
    // setSlot(value);
  }


  useEffect(() => {
    if (textInputValue) {
      const delayDebounceFn = setTimeout(async () => {
        async function searchSpotify() {
          if (token) {
            const { errorMsg, data } = await callSpotifyApi({
              method: 'GET',
              path: 'search',
              data: {
                q: textInputValue,
                type: slotType
              },
              token,
            });
            if (errorMsg) {
              console.error(errorMsg);
            } else {
              const { [SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE[slotType]]: { items } } = data || {};
              setResults(items);
              setOptions(items.map((item: any) => item.name));
            }
          } else {
            console.error('No token provided');
          }
        }

        await searchSpotify();
      }, 800)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [textInputValue]);

  return (
    <Autocomplete
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          variant="outlined"
          onChange={(e) => setTextInputValue(e.target.value)}
          value={textInputValue}
        />
      )}
      onChange={(event, value) => handleSelect(value)}
    />
  );
}

export default SearchInput;