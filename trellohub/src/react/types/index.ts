// src/types/board.ts
export interface Card {
  id: string;
  title: string;
  description?: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardState {
  columns: Column[];
}

export interface DragState {
  draggedItem: {
    type: "card" | "column";
    id: string;
    sourceColumnId?: string;
    sourceIndex?: number;
  } | null;
  dragOverColumn: string | null;
  dragOverIndex: number | null;
  dragOutside: boolean;
}