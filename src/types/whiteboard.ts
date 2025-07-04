export interface Point {
  x: number;
  y: number;
}

export interface DrawingData {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser';
  points: Point[];
  color: string;
  strokeWidth: number;
  fill?: boolean;
  
  timestamp: number;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  isDrawing?: boolean;
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  users: User[];
  drawings: DrawingData[];
  maxUsers?: number;
}

export interface CursorData {
  userId: string;
  x: number;
  y: number;
  isDrawing: boolean;
}

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'eraser' | 'select';