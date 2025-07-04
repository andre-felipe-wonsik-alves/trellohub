import type { Card } from "../types";
import { generateId } from "../utils/idGenerator";

export class CardModel {
  static create(title: string, description = "", status: Card["status"] = "todo"): Card {
    return { id: generateId(), title, description, status};
  }

  static update(card: Card, updates: Partial<Card>): Card {
    return { ...card, ...updates };
  }

  static setStatus(card: Card, status: Card["status"]): Card {
    return {
      ...card,
      status,
    };
  }
}
