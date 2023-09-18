import { SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME, SLOT_TYPES_THAT_REQUIRE_ARTIST } from "../constants";

export const requiresArtist = (type: keyof typeof SLOT_TYPES_MAP_BY_ID | keyof typeof SLOT_TYPES_MAP_BY_NAME) => {
  if (typeof type === 'string') {
    return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(SLOT_TYPES_MAP_BY_NAME[type]);
  }
  return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(type);
};  