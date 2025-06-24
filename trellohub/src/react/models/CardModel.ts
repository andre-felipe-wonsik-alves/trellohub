import type { Card } from "../types";
import { generateId } from "../utils/idGenerator";

export class CardModel {
  static create(title: string, description = ""): Card {
    return { id: generateId(), title, description };
  }

  static update(card: Card, updates: Partial<Card>): Card {
    return { ...card, ...updates };
  }
}
