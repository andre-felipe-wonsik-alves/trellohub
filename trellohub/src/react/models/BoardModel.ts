import type { BoardState, Column } from "../types";

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
    const newColumns = [...board.columns];

    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === fromColumnId
    );
    const destColIndex = newColumns.findIndex((col) => col.id === toColumnId);

    if (sourceColIndex === -1 || destColIndex === -1) return board;

    const sourceColumn = { ...newColumns[sourceColIndex] };
    const destColumn = { ...newColumns[destColIndex] };

    const cardIndex = sourceColumn.cards.findIndex(
      (card) => card.id === cardId
    );
    if (cardIndex === -1) return board;

    const [card] = sourceColumn.cards.splice(cardIndex, 1);

    if (fromColumnId === toColumnId) {
      const adjustedIndex = toIndex > cardIndex ? toIndex - 1 : toIndex;
      destColumn.cards.splice(adjustedIndex, 0, card);
    } else {
      destColumn.cards.splice(toIndex, 0, card);
    }

    newColumns[sourceColIndex] = sourceColumn;
    newColumns[destColIndex] = destColumn;

    return { columns: newColumns };
  }

  static removeCard(board: BoardState, cardId: string): BoardState {
    return {
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    };
  }
}
