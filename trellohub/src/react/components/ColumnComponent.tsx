import React, { useRef } from "react";
import { Edit2, Trash2, GripVertical, Plus } from "lucide-react";
import type { Column, Card, DragState } from "../types";
import CardComponent from "./CardComponent";
import DropZone from "./DropZone";
import Button from "./ui/button";

interface ColumnComponentProps {
  column: Column;
  index: number;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardDragStart: (cardId: string, columnId: string, index: number) => void;
  onCardDragEnd: () => void;
  onColumnDragStart: (columnId: string, index: number) => void;
  onColumnDragEnd: () => void;
  onDropZoneDrop: (columnId: string, index: number) => void;
  dragState: DragState;
  isDragging: boolean;
}

const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  index,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
  onCardDragStart,
  onCardDragEnd,
  onColumnDragStart,
  onColumnDragEnd,
  onDropZoneDrop,
  dragState,
  isDragging
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragState.draggedItem?.type === "card") {
      onDropZoneDrop(column.id, column.cards.length);
    }
  };

  const isDropZoneActive = (cardIndex: number) => {
    return (
      dragState.draggedItem?.type === "card" &&
      dragState.dragOverColumn === column.id &&
      dragState.dragOverIndex === cardIndex
    );
  };

  return (
    <div
      ref={columnRef}
      className={`bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 transition-all duration-200 ${
        isDragging ? "opacity-50 transform rotate-1 scale-95" : ""
      } ${
        dragState.dragOverColumn === column.id &&
        dragState.draggedItem?.type === "card"
          ? "ring-2 ring-blue-400 bg-blue-50"
          : ""
      }`}
    >
      <div
        className="flex items-center justify-between mb-4 cursor-move group"
        draggable
        onDragStart={(e) => {
          onColumnDragStart(column.id, index);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={onColumnDragEnd}
      >
        <h3 className="font-semibold text-gray-800 flex items-center">
          <GripVertical
            size={16}
            className="mr-2 text-gray-400 group-hover:text-gray-600"
          />
          {column.title}
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {column.cards.length}
          </span>
        </h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditColumn(column.id);
            }}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteColumn(column.id);
            }}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="min-h-[200px]" onDragOver={handleDragOver} onDrop={handleDrop}>
        <DropZone
          columnId={column.id}
          index={0}
          isActive={isDropZoneActive(0)}
          onDrop={onDropZoneDrop}
        />

        {column.cards.map((card, cardIndex) => (
          <div key={card.id} className="group">
            <CardComponent
              card={card}
              columnId={column.id}
              index={cardIndex}
              onEdit={onEditCard}
              onDelete={(cardId) => onDeleteCard(column.id, cardId)}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              isDragging={dragState.draggedItem?.id === card.id}
            />
            <DropZone
              columnId={column.id}
              index={cardIndex + 1}
              isActive={isDropZoneActive(cardIndex + 1)}
              onDrop={onDropZoneDrop}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={() => onAddCard(column.id)}
        className="w-full mt-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
      >
        <Plus size={16} className="mr-1" />
        Adicionar cartão
      </Button>
    </div>
  );
};

export default ColumnComponent;