// utils/pgnUtils.ts
import { Chess } from 'chess.js';

/**
 * Returns PGN string from a given Chess instance
 */
export const getPgn = (chess: Chess) => {
  return chess.pgn();
};

/**
 * Loads a Chess instance from PGN string
 */
export const loadPgn = (pgn: string) => {
  const chess = new Chess();
  try {
    chess.load(pgn); // returns void
  } catch {
    throw new Error('Invalid PNG string');
  }
  return chess;
};

/**
 * Returns move list from PGN
 */
export const getMovesFromPgn = (pgn: string) => {
  const chess = loadPgn(pgn);
  return chess.history();
};
