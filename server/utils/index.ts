import { JWT_SECRET } from "../constants/index";
import jwt from 'jsonwebtoken';

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
