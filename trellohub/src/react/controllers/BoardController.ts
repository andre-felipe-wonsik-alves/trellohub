import type { BoardState, Column, Card } from "../types";
import { BoardModel } from "../models/BoardModel";
import { ColumnModel } from "../models/ColumnModel";

export class BoardController {
  static addColumn(board: BoardState, title: string): BoardState {
    const newColumn = ColumnModel.create(title);
    return BoardModel.addColumn(board, newColumn);
  }

  static renameColumn(
    board: BoardState,
    columnId: string,
    newTitle: string
  ): BoardState {
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.updateTitle(column, newTitle);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static deleteColumn(board: BoardState, columnId: string): BoardState {
    return BoardModel.removeColumn(board, columnId);
  }

  static async addCard(
    board: BoardState,
    columnId: string,
    title: string,
    description = "",
    github: { token: string; owner: string; repo: string }
  ): Promise<BoardState> {
    // Cria issue no GitHub
    const issue = await window.electronAPI.createIssue(
      github.token,
      github.owner,
      github.repo,
      title,
      description
    );
    // Cria card localmente com dados da issue
    const newCard: Card = {
      id: issue.number.toString(), // ou issue.id, conforme seu modelo
      title: issue.title,
      description: issue.body,
      status: "todo", // ou mapeie conforme necessário
    };
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.addCard(column, newCard);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static async editCard(
    board: BoardState,
    updatedCard: Card,
    github: { token: string; owner: string; repo: string }
  ): Promise<BoardState> {
    // Atualiza issue no GitHub
    await window.electronAPI.updateIssue(
      github.token,
      github.owner,
      github.repo,
      Number(updatedCard.id),
      {
        title: updatedCard.title,
        body: updatedCard.description,
      }
    );
    // Atualiza card localmente
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

  static async deleteCard(
    board: BoardState,
    columnId: string,
    cardId: string,
    github: { token: string; owner: string; repo: string }
  ): Promise<BoardState> {
    // Fecha a issue no GitHub (não deleta de fato)
    await window.electronAPI.closeIssue(
      github.token,
      github.owner,
      github.repo,
      Number(cardId)
    );
    // Remove card localmente
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
    return BoardModel.moveCard(
      board,
      cardId,
      fromColumnId,
      toColumnId,
      toIndex
    );
  }

  static moveColumn(
    board: BoardState,
    fromIndex: number,
    toIndex: number
  ): BoardState {
    return BoardModel.moveColumn(board, fromIndex, toIndex);
  }
}
