import React from "react";

interface DropZoneProps {
  columnId: string;
  index: number;
  isActive: boolean;
  onDrop: (columnId: string, index: number) => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  columnId, index, isActive, onDrop,
}) => {
    return (
        <div
      className={`transition-all duration-200 ${
        isActive
          ? "h-8 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mb-2"
          : "h-1"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(columnId, index);
      }}
    />
  );
};

export default DropZone;