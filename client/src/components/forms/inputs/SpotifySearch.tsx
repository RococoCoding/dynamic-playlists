import { useEffect, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import { SearchResultOption, SpotifyEntry } from '../../../types';
import { useTokenContext } from '../../../contexts/token';
import { SLOT_TYPES_MAP_BY_NAME, SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE } from '../../../constants';
import { requiresArtist } from '../../../utils';
import useSpotifyApi from '../../../utils/useSpotifyApi';

type Props = {
  selectedOption: SearchResultOption | null;
  setSelectedOption: (option: SearchResultOption | null) => void;
  setSelectedEntry: (entry: SpotifyEntry | null) => void;
  slotType: keyof typeof SLOT_TYPES_MAP_BY_NAME;
}

function SearchInput({ selectedOption, setSelectedOption, setSelectedEntry, slotType }: Props) {
  const { callSpotifyApi } = useSpotifyApi();
  const { currToken } = useTokenContext();
  const [spotifyEntries, setSpotifyEntries] = useState<any[]>([]);
  const [options, setOptions] = useState<SearchResultOption[]>([]);
  const [textInputValue, setTextInputValue] = useState<string>('');
  const handleSelect = (option: SearchResultOption | undefined) => {
    if (option) {
      setSelectedOption(option);
      const selectedEntry = spotifyEntries.find((entry) => entry.id === option.value);
      if (selectedEntry) {
        setSelectedEntry(selectedEntry);
      } else {
        console.error('No entry found for selected d: ', option);
      }
    }
  }


  useEffect(() => {
    if (textInputValue) {
      const delayDebounceFn = setTimeout(async () => {
        async function searchSpotify() {
          if (currToken) {
            const options = { dataAsQueryParams: true }
            const { errorMsg, data } = await callSpotifyApi({
              method: 'GET',
              path: 'search',
              data: {
                q: textInputValue,
                type: slotType
              },
            }, options);
            if (errorMsg) {
              console.error(errorMsg);
            } else {
              const { [SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE[slotType]]: { items } } = data || {};
              setSpotifyEntries(items);
              setOptions(items.map((item: any) => {
                let album = item.album;
                if (slotType === 'album') {
                  album = item;
                }
                return {
                  label: `${item.name}${requiresArtist(slotType) ? ` - ${item.artists[0].name}` : ''}`,
                  altText: `Cover art for album ${album?.name}`,
                  imageUrl: album?.images[0]?.url,
                  value: item.id
                }
              }));
            }
          } else {
            console.error('No currToken provided');
          }
        }

        await searchSpotify();
      }, 800)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [callSpotifyApi, slotType, textInputValue, currToken]);

  return (
    <Autocomplete
      options={options}
      renderOption={(muiOption) => {
        // @ts-expect-error confirmed typing inaccuracy and 'key' exists as a property of muiOption
        const { imageUrl, label, altText } = options.find((opt) => opt.label === muiOption.key) || {};
        return <Box
          {...muiOption}
          key={muiOption.id}
          style={{ fontSize: '0.7rem' }}
          component="li"
        >
          {imageUrl &&
            <img src={imageUrl} alt={altText} style={{ paddingRight: '5px', width: '30px', height: '30px' }} />
          }
          {label}
        </Box>
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          variant="outlined"
          onChange={(e) => setTextInputValue(e.target.value)}
          value={selectedOption?.label || textInputValue}
        />
      )}
      onChange={(event, value) => value && handleSelect(value)}
      value={selectedOption}
    />
  );
}

export default SearchInput;