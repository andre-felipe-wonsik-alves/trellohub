import React from "react";

interface ColumnDropZoneProps {
  index: number;
  isActive: boolean;
  onDrop: (index: number) => void;
  onDragOver: (index: number) => void;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ index, isActive, onDrop, onDragOver }) => {
  return (
    <div
      className={`transition-all duration-200 ${
        isActive
          ? "w-4 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mx-2"
          : "w-1"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
    />
  );
};

export default ColumnDropZone;
