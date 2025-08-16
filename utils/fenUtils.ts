// utils/fenUtils.ts
import { Chess } from 'chess.js';

/**
 * Returns FEN string from a given Chess instance
 */
export const getFen = (chess: Chess) => {
  return chess.fen();
};

/**
 * Loads a Chess instance from a FEN string
 */
export const loadFen = (fen: string) => {
  const chess = new Chess();
  try {
    chess.load(fen); // returns void
  } catch {
    throw new Error('Invalid FEN string');
  }
  return chess;
};

/**
 * Checks if two FEN strings represent the same position
 */
export const isSamePosition = (fen1: string, fen2: string) => {
  return fen1 === fen2;
};
