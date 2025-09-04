// ============================ lib/chess.ts ============================
import { Chess } from 'chess.js';

export function newChess(fen?: string) {
  const c = new Chess();
  if (fen)
    try {
      c.load(fen);
      // eslint-disable-next-line no-empty
    } catch {}
  return c;
}
