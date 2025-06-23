import React from "react";
import { Trash2} from "lucide-react";

interface TrashZoneProps {
  isActive: boolean;
  onDrop: () => void;
}

const TrashZone: React.FC<TrashZoneProps> = ({ isActive, onDrop }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 transition-all duration-300 z-50 ${
        isActive
          ? "bg-red-500 text-white scale-110 shadow-2xl animate-pulse"
          : "bg-red-400 text-red-100 scale-100 shadow-lg"
      } rounded-full p-4 border-4 border-dashed ${
        isActive ? "border-red-200" : "border-red-300"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <Trash2 size={32} />
      <div className="text-xs font-bold mt-1 text-center">
        {isActive ? "SOLTE AQUI" : "LIXEIRA"}
      </div>
    </div>
  );
};

export default TrashZone;