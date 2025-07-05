import type { BoardState, Column, Card } from "../types";
import { BoardModel } from "../models/BoardModel";
import { ColumnModel } from "../models/ColumnModel";
import { CardModel } from "../models/CardModel";
import { GithubApiService } from "../../electron/github/github-api-service";

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

  static async addCardWithGithub(
    board: BoardState,
    columnId: string,
    title: string,
    description = "",
    githubToken: string,
    owner: string,
    repo: string
  ): Promise<BoardState> {
    const github = new GithubApiService();
    // Cria issue no GitHub
    const issue = await github.create_issue(githubToken, owner, repo, title, description);
    // Cria card localmente usando dados da issue
    const newCard = {
      id: issue.id.toString(), // ou issue.number, conforme sua modelagem
      title: issue.title,
      description: issue.body,
      // ...outros campos se necessário
    };
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return board;
    const updatedColumn = ColumnModel.addCard(column, newCard);
    return BoardModel.updateColumn(board, columnId, updatedColumn);
  }

  static async editCardWithGithub(
    board: BoardState,
    updatedCard: Card,
    githubToken: string,
    owner: string,
    repo: string
  ): Promise<BoardState> {
    const github = new GithubApiService();
    // Atualiza issue no GitHub
    await github.update_issue(
      githubToken,
      owner,
      repo,
      Number(updatedCard.id), // id deve ser o número da issue
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

  static async deleteCardWithGithub(
    board: BoardState,
    columnId: string,
    cardId: string,
    githubToken: string,
    owner: string,
    repo: string
  ): Promise<BoardState> {
    const github = new GithubApiService();
    // Fecha a issue no GitHub
    await github.close_issue(githubToken, owner, repo, Number(cardId));
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
    return BoardModel.moveCard(board, cardId, fromColumnId, toColumnId, toIndex);
  }

  static moveColumn(board: BoardState, fromIndex: number, toIndex: number): BoardState {
    return BoardModel.moveColumn(board, fromIndex, toIndex);
  }
}

