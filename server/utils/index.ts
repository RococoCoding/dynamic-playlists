import { JWT_SECRET, VALID_SLOT_TYPES } from "../constants/index";
import jwt from 'jsonwebtoken';
import assert = require("node:assert");
import { validate as UUIDValidate } from 'uuid';
import { Slot, SlotInput } from "../types";

export const generateRandomString = function (length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const generateToken = (username: string) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set.');
  }
  const payload = {
    subject: username
  };
  const options = {
    expiresIn: '1h'
  };
  return jwt.sign(payload, JWT_SECRET!, options);
}

export const getErrorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.error_description || error?.response?.data?.error
|| error?.response?.data || error?.message || error;

export const isNonEmptyString = (string: string) => {
  return typeof string === 'string' && string.length > 0;
}

export const validateStringId = (id: string) => {
  assert(isNonEmptyString(id), 'Invalid id provided');
}

export const validateUUID = (id: string) => {
  assert(UUIDValidate(id), 'Invalid id provided');
}

export const validateSlotType = (type: string) => {
  assert(type && VALID_SLOT_TYPES.includes(type), 'Invalid slot type provided');
};

export const validateSlotInput = (slot: SlotInput, allFieldsOptional: boolean = false) => {
  const {
    type,
    name,
    artist_name,
    position
  } = slot;
  // required fields
  if (!allFieldsOptional|| type) {
    validateSlotType(type);
  }
  if (!allFieldsOptional|| name) {
    assert(isNonEmptyString(name), 'Invalid slot name provided');
  }
  if (!allFieldsOptional|| position) {
    assert(typeof position === 'number' && position >= 0, 'Invalid slot position provided');
  }
  
  // optional fields
  assert(!artist_name || Array.isArray(artist_name), 'Invalid artist name provided');
}

export const validateCreateSlotInput = (slot: SlotInput) => {
  validateSlotInput(slot);
  validateStringId(slot.playlist_id);
}

export const validateUpdateSlotInput = (slot: SlotInput) => {
  const { current_track, pool_id } = slot;
  validateSlotInput(slot, true);
  if (current_track) {
    validateStringId(current_track);
  }
  if (pool_id) {
    validateUUID(pool_id);
  }
}