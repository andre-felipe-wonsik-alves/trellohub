import type { BoardState, Column, Card } from "../types";
import { BoardModel } from "../models/BoardModel";
import { ColumnModel } from "../models/ColumnModel";
import { CardModel } from "../models/CardModel";

export class BoardController {
  static addColumn(board: BoardState, title: string): BoardState {
    const newColumn = ColumnModel.create(title);
    return BoardModel.addColumn(board, newColumn);
  }

  static renameColumn(board: BoardState, columnId: string, newTitle: string): BoardState {
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.updateTitle(column, newTitle);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static deleteColumn(board: BoardState, columnId: string): BoardState {
    return BoardModel.removeColumn(board, columnId);
  }

  static addCard(board: BoardState, columnId: string, title: string, description = ""): BoardState {
    const newCard = CardModel.create(title, description);
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.addCard(column, newCard);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static editCard(board: BoardState, updatedCard: Card): BoardState {
    const column = board.columns.find((col) =>
      col.cards.some((card) => card.id === updatedCard.id)
    );
    if (!column) return board;

    const updatedColumn: Column = {
      ...column,
      cards: column.cards.map((card) =>
        card.id === updatedCard.id ? updatedCard : card
      ),
    };

    return BoardModel.updateColumn(board, column.id, updatedColumn);
  }

  static deleteCard(board: BoardState, columnId: string, cardId: string): BoardState {
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.removeCard(column, cardId);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static moveCard(
    board: BoardState,
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number
  ): BoardState {
    return BoardModel.moveCard(board, cardId, fromColumnId, toColumnId, toIndex);
  }

  static moveColumn(board: BoardState, fromIndex: number, toIndex: number): BoardState {
    return BoardModel.moveColumn(board, fromIndex, toIndex);
  }
}

