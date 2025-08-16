// utils/validators.ts

/**
 * Checks if OTP is exactly 6 digits
 */
export const isValidOtp = (otp: string) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Checks if an email address is valid
 */
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Checks if a move is valid in current chess instance
 */
import { Chess } from 'chess.js';
export const isValidMove = (chess: Chess, move: string) => {
  return chess.moves().includes(move);
};
