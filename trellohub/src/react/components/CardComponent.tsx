import React from "react";
import type { Card } from "../types";
import { Edit2, Trash2 } from "lucide-react";

interface CardComponentProps {
  card: Card;
  columnId: string;
  index: number;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onDragStart: (cardId: string, columnId: string, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  columnId,
  index,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-3 mb-2 cursor-move group transition-transform ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
      draggable
      onDragStart={() => onDragStart(card.id, columnId, index)}
      onDragEnd={onDragEnd}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{card.title}</h4>
          {card.description && (
            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
          )}
          <span className="inline-block mt-2 text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full">
            {card.status}
          </span>
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
