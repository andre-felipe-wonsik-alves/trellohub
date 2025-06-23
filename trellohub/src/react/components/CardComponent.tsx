import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { Card } from "../types";

interface CardProps {
  card: Card;
  columnId: string;
  index: number;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onDragStart: (cardId: string, columnId: string, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const CardComponent: React.FC<CardProps> = ({
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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-move hover:shadow-md transition-all duration-200 ${
        isDragging
          ? "opacity-30 transform rotate-3 scale-95"
          : "hover:scale-[1.02]"
      }`}
      draggable
      onDragStart={(e) => {
        onDragStart(card.id, columnId, index);
        const dragImage = document.createElement("div");
        dragImage.className =
          "bg-white rounded-lg shadow-lg border-2 border-blue-400 p-3";
        dragImage.style.position = "absolute";
        dragImage.style.top = "-1000px";
        dragImage.innerHTML = `<div class="font-medium text-gray-900">${card.title}</div>`;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 50, 25);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-gray-600">{card.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
