export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type ChessBoard = (ChessPiece | null)[][];

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
}

export type ChessMove = {
  from: string;
  to: string;
  promotion?: string;
};
