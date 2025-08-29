// ============================ User ============================
export interface IUser {
  _id: string;
  phone?: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string; // ISO string si envoyé par API
  lastLogin?: string;
  rating: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

// ============================ Move ============================
export interface IMove {
  _id: string;
  gameId: string;
  player?: string; // null si AI
  isAI: boolean;
  from: string;
  to: string;
  fen: string;
  moveNumber: number;
  promotion?: string;
  createdAt?: string;
}

// ============================ Game ============================
export interface IGame {
  _id: string;
  players: string[];
  whitePlayer: string;
  blackPlayer: string;
  status: 'pending' | 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  fen: string;
  pgn?: string;
  turn?: string; // contient l’_id du joueur dont c’est le tour
  winner?: string;
  moves: string[] | IMove[];
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  timeControl: string;
}

// ============================ Helpers ============================
export type PlayerColor = 'w' | 'b' | null;

export interface IGameWithPlayerColor extends IGame {
  playerColor: PlayerColor; // déterminé côté frontend en comparant user._id
}
