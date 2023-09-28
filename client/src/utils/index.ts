import { SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME, SLOT_TYPES_THAT_REQUIRE_ARTIST } from "../constants";

export const requiresArtist = (type: keyof typeof SLOT_TYPES_MAP_BY_ID | keyof typeof SLOT_TYPES_MAP_BY_NAME) => {
  if (typeof type === 'string') {
    return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(SLOT_TYPES_MAP_BY_NAME[type]);
  }
  return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(type);
};  

export const getToken = () => {
  return localStorage.getItem('access_token');
}

export const setToken = (token: string) => {
  if (!token || token === 'undefined') {
    throw new Error(`Missing or invalid token: ${token}`)
  }
  localStorage.setItem('access_token', token);
}

export const tokenExists = (token?: string | null) => !!token && token !== 'undefined';

export const getErrorMessage = (error: any) => error?.response?.data?.error?.message || error?.message;