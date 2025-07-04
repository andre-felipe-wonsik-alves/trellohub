import type { BoardState, Column, Card } from "../types";
import { CardModel } from "./CardModel";

export class BoardModel {
  static addColumn(
    board: BoardState,
    column: Column,
    index?: number
  ): BoardState {
    const newColumns = [...board.columns];
    if (index !== undefined && index >= 0) {
      newColumns.splice(index, 0, column);
    } else {
      newColumns.push(column);
    }
    return { columns: newColumns };
  }

  static removeColumn(board: BoardState, columnId: string): BoardState {
    return {
      columns: board.columns.filter((col) => col.id !== columnId),
    };
  }

  static updateColumn(
    board: BoardState,
    columnId: string,
    updatedColumn: Column
  ): BoardState {
    return {
      columns: board.columns.map((col) =>
        col.id === columnId ? updatedColumn : col
      ),
    };
  }

  static moveColumn(
    board: BoardState,
    fromIndex: number,
    toIndex: number
  ): BoardState {
    const newColumns = [...board.columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    return { columns: newColumns };
  }

  static moveCard(
    board: BoardState,
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number
  ): BoardState {
    const sourceColumn = board.columns.find((col) => col.id === fromColumnId);
    const targetColumn = board.columns.find((col) => col.id === toColumnId);

    if (!sourceColumn || !targetColumn) return board;

    const cardToMove = sourceColumn.cards.find((c) => c.id === cardId);
    if (!cardToMove) return board;

    const updatedCard = CardModel.setStatus(cardToMove, BoardModel.mapColumnTitleToStatus(targetColumn.title));

    const updatedSource: Column = {
      ...sourceColumn,
      cards: sourceColumn.cards.filter((c) => c.id !== cardId),
    };

    const updatedTarget: Column = {
      ...targetColumn,
      cards: [...targetColumn.cards.slice(0, toIndex), updatedCard, ...targetColumn.cards.slice(toIndex)],
    };

    return {
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === updatedSource.id) return updatedSource;
        if (col.id === updatedTarget.id) return updatedTarget;
        return col;
      }),
    };
  }

  static removeCard(board: BoardState, cardId: string): BoardState {
    return {
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    };
  }

  private static mapColumnTitleToStatus(title: string): Card["status"] {
    const normalized = title.trim().toLowerCase();
    if (normalized.includes("fazer")) return "todo";
    if (normalized.includes("progresso")) return "in-progress";
    if (normalized.includes("conclu")) return "done";
    return "todo";
  }
}
