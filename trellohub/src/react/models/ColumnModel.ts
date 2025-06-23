import type { Column, Card } from "../types";
import { generateId } from "../utils/idGenerator";

export class ColumnModel {
  static create(title: string): Column {
    return {
      id: generateId(),
      title,
      cards: [],
    };
  }

  static updateTitle(column: Column, title: string): Column {
    return { ...column, title };
  }

  static addCard(column: Column, card: Card, index?: number): Column {
    const newCards = [...column.cards];
    if (index !== undefined && index >= 0) {
      newCards.splice(index, 0, card);
    } else {
      newCards.push(card);
    }
    return { ...column, cards: newCards };
  }

  static removeCard(column: Column, cardId: string): Column {
    return {
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    };
  }

  static moveCard(column: Column, fromIndex: number, toIndex: number): Column {
    const newCards = [...column.cards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);
    return { ...column, cards: newCards };
  }
}
