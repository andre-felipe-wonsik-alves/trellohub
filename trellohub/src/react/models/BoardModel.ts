import type { BoardState, Column, Card } from "../types";
import { CardModel } from "./CardModel";

export class BoardModel {
  static addColumn(board: BoardState, column: Column): BoardState {
    return { ...board, columns: [...board.columns, column] };
  }

  static updateColumn(
    board: BoardState,
    columnId: string,
    updatedColumn: Column
  ): BoardState {
    return {
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId ? updatedColumn : col
      ),
    };
  }

  static removeColumn(board: BoardState, columnId: string): BoardState {
    return {
      ...board,
      columns: board.columns.filter((col) => col.id !== columnId),
    };
  }

  static moveColumn(
    board: BoardState,
    fromIndex: number,
    toIndex: number
  ): BoardState {
    const newColumns = [...board.columns];
    const [moved] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, moved);
    return { ...board, columns: newColumns };
  }

  static removeCard(board: BoardState, cardId: string): BoardState {
    return {
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    };
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

    const updatedCard =
      fromColumnId === toColumnId
        ? cardToMove
        : CardModel.setStatus(
            cardToMove,
            BoardModel.mapColumnTitleToStatus(targetColumn.title)
          );

    if (fromColumnId === toColumnId) {
      const newCards = [...sourceColumn.cards];
      const fromIndex = newCards.findIndex((c) => c.id === cardId);
      if (fromIndex === -1 || fromIndex === toIndex) return board;

      const [movedCard] = newCards.splice(fromIndex, 1);
      newCards.splice(toIndex, 0, movedCard);

      const updatedColumn: Column = { ...sourceColumn, cards: newCards };

      return BoardModel.updateColumn(board, fromColumnId, updatedColumn);
    } else {
      const updatedSource: Column = {
        ...sourceColumn,
        cards: sourceColumn.cards.filter((c) => c.id !== cardId),
      };

      const updatedTarget: Column = {
        ...targetColumn,
        cards: [
          ...targetColumn.cards.slice(0, toIndex),
          updatedCard,
          ...targetColumn.cards.slice(toIndex),
        ],
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
  }

  private static mapColumnTitleToStatus(title: string): Card["status"] {
    const normalized = title.trim().toLowerCase();
    if (normalized.includes("fazer")) return "todo";
    if (normalized.includes("progresso")) return "in-progress";
    if (normalized.includes("conclu")) return "done";
    return "todo";
  }
}

export default BoardModel;
