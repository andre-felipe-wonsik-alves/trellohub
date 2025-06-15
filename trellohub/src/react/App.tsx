import React, { useState, useCallback, useRef } from 'react';
import { Plus, X, Edit2, Trash2, GripVertical } from 'lucide-react';

// Princípio SOLID: Single Responsibility - Cada classe/função tem uma única responsabilidade

// Interfaces para tipagem (Dependency Inversion Principle)
interface Card {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface BoardState {
  columns: Column[];
}

interface DragState {
  draggedItem: {
    type: 'card' | 'column';
    id: string;
    sourceColumnId?: string;
    sourceIndex?: number;
  } | null;
  dragOverColumn: string | null;
  dragOverIndex: number | null;
  dragOutside: boolean;
}

// Utility functions (Single Responsibility)
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Card Management Service (Single Responsibility + Open/Closed Principle)
class CardService {
  static createCard(title: string, description?: string): Card {
    return {
      id: generateId(),
      title,
      description
    };
  }

  static updateCard(card: Card, updates: Partial<Card>): Card {
    return { ...card, ...updates };
  }
}

// Column Management Service (Single Responsibility)
class ColumnService {
  static createColumn(title: string): Column {
    return {
      id: generateId(),
      title,
      cards: []
    };
  }

  static addCardToColumn(column: Column, card: Card, index?: number): Column {
    const newCards = [...column.cards];
    if (index !== undefined && index >= 0) {
      newCards.splice(index, 0, card);
    } else {
      newCards.push(card);
    }
    return {
      ...column,
      cards: newCards
    };
  }

  static removeCardFromColumn(column: Column, cardId: string): Column {
    return {
      ...column,
      cards: column.cards.filter(card => card.id !== cardId)
    };
  }

  static updateColumnTitle(column: Column, title: string): Column {
    return { ...column, title };
  }

  static moveCardWithinColumn(column: Column, fromIndex: number, toIndex: number): Column {
    const newCards = [...column.cards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);
    return { ...column, cards: newCards };
  }
}

// Board Management Service (Single Responsibility)
class BoardService {
  static addColumn(board: BoardState, column: Column, index?: number): BoardState {
    const newColumns = [...board.columns];
    if (index !== undefined && index >= 0) {
      newColumns.splice(index, 0, column);
    } else {
      newColumns.push(column);
    }
    return { columns: newColumns };
  }

  static removeColumn(board: BoardState, columnId: string): BoardState {
    return {
      columns: board.columns.filter(col => col.id !== columnId)
    };
  }

  static updateColumn(board: BoardState, columnId: string, updatedColumn: Column): BoardState {
    return {
      columns: board.columns.map(col => 
        col.id === columnId ? updatedColumn : col
      )
    };
  }

  static moveColumn(board: BoardState, fromIndex: number, toIndex: number): BoardState {
    const newColumns = [...board.columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    return { columns: newColumns };
  }

  static moveCard(board: BoardState, cardId: string, fromColumnId: string, toColumnId: string, toIndex: number): BoardState {
    const newColumns = [...board.columns];
    
    // Find source and destination columns
    const sourceColIndex = newColumns.findIndex(col => col.id === fromColumnId);
    const destColIndex = newColumns.findIndex(col => col.id === toColumnId);
    
    if (sourceColIndex === -1 || destColIndex === -1) return board;
    
    const sourceColumn = { ...newColumns[sourceColIndex] };
    const destColumn = { ...newColumns[destColIndex] };
    
    // Find and remove card from source
    const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return board;
    
    const [card] = sourceColumn.cards.splice(cardIndex, 1);
    
    // Add card to destination
    if (fromColumnId === toColumnId) {
      // Moving within same column
      const adjustedIndex = toIndex > cardIndex ? toIndex - 1 : toIndex;
      destColumn.cards.splice(adjustedIndex, 0, card);
    } else {
      // Moving to different column
      destColumn.cards.splice(toIndex, 0, card);
    }
    
    newColumns[sourceColIndex] = sourceColumn;
    newColumns[destColIndex] = destColumn;
    
    return { columns: newColumns };
  }

  static removeCard(board: BoardState, cardId: string): BoardState {
    return {
      columns: board.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card => card.id !== cardId)
      }))
    };
  }
}

// Card Component (Single Responsibility)
const CardComponent: React.FC<{
  card: Card;
  columnId: string;
  index: number;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onDragStart: (cardId: string, columnId: string, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}> = ({ card, columnId, index, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) => {

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-move hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-30 transform rotate-3 scale-95' : 'hover:scale-[1.02]'
      }`}
      draggable
      onDragStart={(e) => {
        onDragStart(card.id, columnId, index);
        // Create a custom drag image
        const dragImage = document.createElement('div');
        dragImage.className = 'bg-white rounded-lg shadow-lg border-2 border-blue-400 p-3';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.innerHTML = `<div class="font-medium text-gray-900">${card.title}</div>`;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 50, 25);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1">{card.title}</h4>
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

// Drop Zone Component for inserting cards
const DropZone: React.FC<{
  columnId: string;
  index: number;
  isActive: boolean;
  onDrop: (columnId: string, index: number) => void;
}> = ({ columnId, index, isActive, onDrop }) => {
  return (
    <div
      className={`transition-all duration-200 ${
        isActive ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mb-2' : 'h-1'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(columnId, index);
      }}
    />
  );
};

// Column Component (Single Responsibility)
const ColumnComponent: React.FC<{
  column: Column;
  index: number;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardDragStart: (cardId: string, columnId: string, cardIndex: number) => void;
  onCardDragEnd: () => void;
  onColumnDragStart: (columnId: string, index: number) => void;
  onColumnDragEnd: () => void;
  onDropZoneDrop: (columnId: string, index: number) => void;
  dragState: DragState;
  isDragging: boolean;
}> = ({ 
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
    if (dragState.draggedItem?.type === 'card') {
      onDropZoneDrop(column.id, column.cards.length);
    }
  };

  const isDropZoneActive = (cardIndex: number) => {
    return dragState.draggedItem?.type === 'card' && 
           dragState.dragOverColumn === column.id && 
           dragState.dragOverIndex === cardIndex;
  };

  return (
    <div 
      ref={columnRef}
      className={`bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 transition-all duration-200 ${
        isDragging ? 'opacity-50 transform rotate-1 scale-95' : ''
      } ${
        dragState.dragOverColumn === column.id && dragState.draggedItem?.type === 'card' 
          ? 'ring-2 ring-blue-400 bg-blue-50' 
          : ''
      }`}
    >
      <div 
        className="flex items-center justify-between mb-4 cursor-move group"
        draggable
        onDragStart={(e) => {
          onColumnDragStart(column.id, index);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={onColumnDragEnd}
      >
        <h3 className="font-semibold text-gray-800 flex items-center">
          <GripVertical size={16} className="mr-2 text-gray-400 group-hover:text-gray-600" />
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

      <div
        className="min-h-[200px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
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

      <button
        onClick={() => onAddCard(column.id)}
        className="w-full mt-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
      >
        <Plus size={16} className="mr-1" />
        Adicionar cartão
      </button>
    </div>
  );
};

// Column Drop Zone for reordering columns
const ColumnDropZone: React.FC<{
  index: number;
  isActive: boolean;
  onDrop: (index: number) => void;
}> = ({ index, isActive, onDrop }) => {
  return (
    <div
      className={`transition-all duration-200 ${
        isActive ? 'w-4 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mx-2' : 'w-1'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
    />
  );
};

// Trash Zone Component
const TrashZone: React.FC<{
  isActive: boolean;
  onDrop: () => void;
}> = ({ isActive, onDrop }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 transition-all duration-300 z-50 ${
        isActive 
          ? 'bg-red-500 text-white scale-110 shadow-2xl animate-pulse' 
          : 'bg-red-400 text-red-100 scale-100 shadow-lg'
      } rounded-full p-4 border-4 border-dashed ${
        isActive ? 'border-red-200' : 'border-red-300'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <Trash2 size={32} />
      <div className="text-xs font-bold mt-1 text-center">
        {isActive ? 'SOLTE AQUI' : 'LIXEIRA'}
      </div>
    </div>
  );
};

// Modal Component (Single Responsibility)
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main TrelloHub Component
const TrelloHub: React.FC = () => {
  const [board, setBoard] = useState<BoardState>({
    columns: [
      {
        id: 'col1',
        title: 'A Fazer',
        cards: [
          { id: 'card1', title: 'Estudar React', description: 'Aprender hooks e context' },
          { id: 'card2', title: 'Fazer compras', description: 'Ir ao supermercado' }
        ]
      },
      {
        id: 'col2',
        title: 'Em Progresso',
        cards: [
          { id: 'card3', title: 'Desenvolver projeto', description: 'TrelloHub' }
        ]
      },
      {
        id: 'col3',
        title: 'Concluído',
        cards: []
      }
    ]
  });

  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dragOverColumn: null,
    dragOverIndex: null,
    dragOutside: false
  });

  const [modalState, setModalState] = useState<{
    type: 'card' | 'column' | null;
    isOpen: boolean;
    data?: any;
  }>({ type: null, isOpen: false });

  const [formData, setFormData] = useState({ title: '', description: '' });

  const boardRef = useRef<HTMLDivElement>(null);

  // Enhanced drag tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.draggedItem) return;

    const boardElement = boardRef.current;
    if (!boardElement) return;

    const boardRect = boardElement.getBoundingClientRect();
    const isOutside = (
      e.clientX < boardRect.left ||
      e.clientX > boardRect.right ||
      e.clientY < boardRect.top ||
      e.clientY > boardRect.bottom
    );

    setDragState(prev => ({
      ...prev,
      dragOutside: isOutside
    }));

    // Find column and position for cards
    if (dragState.draggedItem.type === 'card') {
      const columns = document.querySelectorAll('[data-column-id]');
      let overColumn: string | null = null;
      let overIndex: number | null = null;

      columns.forEach((col) => {
        const rect = col.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && 
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          overColumn = col.getAttribute('data-column-id');
          
          // Find insertion index based on Y position
          const cards = col.querySelectorAll('[data-card-index]');
          overIndex = 0;
          
          cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            if (e.clientY > cardRect.top + cardRect.height / 2) {
              overIndex = index + 1;
            }
          });
        }
      });

      setDragState(prev => ({
        ...prev,
        dragOverColumn: overColumn,
        dragOverIndex: overIndex
      }));
    }
  }, [dragState.draggedItem]);

  // Add global mouse move listener
  React.useEffect(() => {
    if (dragState.draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [dragState.draggedItem, handleMouseMove]);

  // Card drag handlers
  const handleCardDragStart = useCallback((cardId: string, columnId: string, index: number) => {
    setDragState({
      draggedItem: { type: 'card', id: cardId, sourceColumnId: columnId, sourceIndex: index },
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, []);

  const handleCardDragEnd = useCallback(() => {
    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, []);

  // Column drag handlers
  const handleColumnDragStart = useCallback((columnId: string, index: number) => {
    setDragState({
      draggedItem: { type: 'column', id: columnId, sourceIndex: index },
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, []);

  const handleColumnDragEnd = useCallback(() => {
    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, []);

  // Drop zone handlers
  const handleDropZoneDrop = useCallback((columnId: string, index: number) => {
    if (!dragState.draggedItem || dragState.draggedItem.type !== 'card') return;

    const { id: cardId, sourceColumnId } = dragState.draggedItem;
    
    if (sourceColumnId) {
      setBoard(prevBoard => 
        BoardService.moveCard(prevBoard, cardId, sourceColumnId, columnId, index)
      );
    }

    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, [dragState.draggedItem]);

  // Column reorder drop
  const handleColumnDrop = useCallback((toIndex: number) => {
    if (!dragState.draggedItem || dragState.draggedItem.type !== 'column') return;

    const fromIndex = dragState.draggedItem.sourceIndex;
    if (fromIndex !== undefined && fromIndex !== toIndex) {
      setBoard(prevBoard => BoardService.moveColumn(prevBoard, fromIndex, toIndex));
    }

    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, [dragState.draggedItem]);

  // Trash drop handler
  const handleTrashDrop = useCallback(() => {
    if (!dragState.draggedItem) return;

    if (dragState.draggedItem.type === 'card') {
      setBoard(prevBoard => BoardService.removeCard(prevBoard, dragState.draggedItem!.id));
    } else if (dragState.draggedItem.type === 'column') {
      setBoard(prevBoard => BoardService.removeColumn(prevBoard, dragState.draggedItem!.id));
    }

    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false
    });
  }, [dragState.draggedItem]);

  // Column Management (Interface Segregation)
  const handleAddColumn = useCallback(() => {
    const title = prompt('Nome da coluna:');
    if (title?.trim()) {
      const newColumn = ColumnService.createColumn(title.trim());
      setBoard(prevBoard => BoardService.addColumn(prevBoard, newColumn));
    }
  }, []);

  const handleEditColumn = useCallback((columnId: string) => {
    const column = board.columns.find(col => col.id === columnId);
    if (column) {
      const newTitle = prompt('Novo nome da coluna:', column.title);
      if (newTitle?.trim()) {
        const updatedColumn = ColumnService.updateColumnTitle(column, newTitle.trim());
        setBoard(prevBoard => BoardService.updateColumn(prevBoard, columnId, updatedColumn));
      }
    }
  }, [board.columns]);

  const handleDeleteColumn = useCallback((columnId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta coluna?')) {
      setBoard(prevBoard => BoardService.removeColumn(prevBoard, columnId));
    }
  }, []);

  // Card Management
  const handleAddCard = useCallback((columnId: string) => {
    setModalState({
      type: 'card',
      isOpen: true,
      data: { columnId, mode: 'create' }
    });
    setFormData({ title: '', description: '' });
  }, []);

  const handleEditCard = useCallback((card: Card) => {
    setModalState({
      type: 'card',
      isOpen: true,
      data: { card, mode: 'edit' }
    });
    setFormData({ title: card.title, description: card.description || '' });
  }, []);

  const handleDeleteCard = useCallback((columnId: string, cardId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      setBoard(prevBoard => {
        const column = prevBoard.columns.find(col => col.id === columnId);
        if (column) {
          const updatedColumn = ColumnService.removeCardFromColumn(column, cardId);
          return BoardService.updateColumn(prevBoard, columnId, updatedColumn);
        }
        return prevBoard;
      });
    }
  }, []);

  const handleModalSubmit = useCallback(() => {
    const { type, data } = modalState;
    
    if (type === 'card') {
      if (data.mode === 'create') {
        if (formData.title.trim()) {
          const newCard = CardService.createCard(formData.title.trim(), formData.description.trim());
          setBoard(prevBoard => {
            const column = prevBoard.columns.find(col => col.id === data.columnId);
            if (column) {
              const updatedColumn = ColumnService.addCardToColumn(column, newCard);
              return BoardService.updateColumn(prevBoard, data.columnId, updatedColumn);
            }
            return prevBoard;
          });
        }
      } else if (data.mode === 'edit') {
        const updatedCard = CardService.updateCard(data.card, {
          title: formData.title.trim(),
          description: formData.description.trim()
        });
        
        setBoard(prevBoard => {
          const column = prevBoard.columns.find(col => 
            col.cards.some(card => card.id === data.card.id)
          );
          if (column) {
            const updatedColumn = {
              ...column,
              cards: column.cards.map(card => 
                card.id === data.card.id ? updatedCard : card
              )
            };
            return BoardService.updateColumn(prevBoard, column.id, updatedColumn);
          }
          return prevBoard;
        });
      }
    }
    
    setModalState({ type: null, isOpen: false });
    setFormData({ title: '', description: '' });
  }, [modalState, formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-full" ref={boardRef}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Meu Kanban Board</h1>
          <button
            onClick={handleAddColumn}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Coluna
          </button>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-4">
          <ColumnDropZone
            index={0}
            isActive={dragState.draggedItem?.type === 'column' && dragState.dragOverIndex === 0}
            onDrop={handleColumnDrop}
          />
          
          {board.columns.map((column, index) => (
            <React.Fragment key={column.id}>
              <div data-column-id={column.id}>
                <ColumnComponent
                  column={column}
                  index={index}
                  onAddCard={handleAddCard}
                  onEditCard={handleEditCard}
                  onDeleteCard={handleDeleteCard}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onCardDragStart={handleCardDragStart}
                  onCardDragEnd={handleCardDragEnd}
                  onColumnDragStart={handleColumnDragStart}
                  onColumnDragEnd={handleColumnDragEnd}
                  onDropZoneDrop={handleDropZoneDrop}
                  dragState={dragState}
                  isDragging={dragState.draggedItem?.id === column.id}
                />
              </div>
              <ColumnDropZone
                index={index + 1}
                isActive={dragState.draggedItem?.type === 'column' && dragState.dragOverIndex === index + 1}
                onDrop={handleColumnDrop}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Trash Zone - only visible when dragging */}
      {dragState.draggedItem && (
        <TrashZone
          isActive={dragState.dragOutside}
          onDrop={handleTrashDrop}
        />
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ type: null, isOpen: false })}
        title={modalState.data?.mode === 'edit' ? 'Editar Cartão' : 'Novo Cartão'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do cartão"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Digite a descrição do cartão"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setModalState({ type: null, isOpen: false })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleModalSubmit}
              disabled={!formData.title.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {modalState.data?.mode === 'edit' ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TrelloHub;