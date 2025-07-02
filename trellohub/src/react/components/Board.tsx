import React, { useRef, useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import type { BoardState, Card, Column, DragState } from "../types";
import ColumnComponent from "./ColumnComponent";
import ColumnDropZone from "./ColumnDropZone";
import TrashZone from "./TrashZone";
import Modal from "./Modal";
import InputModal from "./InputModal";
import ConfirmationModal from "./ConfirmationModal";
import { CardModel } from "../models/CardModel";
import { ColumnModel } from "../models/ColumnModel";
import { BoardModel } from "../models/BoardModel";

const Board: React.FC = () => {
  const [board, setBoard] = useState<BoardState>({
    columns: [
      {
        id: "col1",
        title: "A Fazer",
        cards: [
          {
            id: "card1",
            title: "Sla",
            description: "Nao sei",
          },
          {
            id: "card2",
            title: "Bora Bill",
            description: "Lá ele",
          },
        ],
      },
      {
        id: "col2",
        title: "Em Progresso",
        cards: [
          {
            id: "card3",
            title: "Desenvolver projeto",
            description: "TrelloHub",
          },
        ],
      },
      {
        id: "col3",
        title: "Concluído",
        cards: [],
      },
    ],
  });

  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dragOverColumn: null,
    dragOverIndex: null,
    dragOutside: false,
  });

  const boardRef = useRef<HTMLDivElement>(null);

  // Modais
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({ title: "", description: "" });

  // Um tanto diferente do original!
  const [inputModal, setInputModal] = useState({
    isOpen: false,
    title: "",
    defaultValue: "",
    onConfirm: (value: string) => {},
  });

  const [cardModal, setCardModal] = useState({
    isOpen: false,
    mode: "create" as "create" | "edit",
    columnId: "",
    card: null as Card | null,
    title: "",
    description: "",
  });

  // Handlers de cartão
  const handleAddCard = (columnId: string) => {
    setCardModal({
      isOpen: true,
      mode: "create",
      columnId,
      card: null,
      title: "",
      description: "",
    });
  };

  const handleEditCard = (card: Card) => {
    setCardModal({
      isOpen: true,
      mode: "edit",
      columnId: "",
      card,
      title: card.title,
      description: card.description || "",
    });
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    setConfirmationModal({
      isOpen: true,
      message: "Tem certeza que deseja excluir este cartão?",
      onConfirm: () => {
        const column = board.columns.find((col) => col.id === columnId);
        if (column) {
          const updated = ColumnModel.removeCard(column, cardId);
          setBoard((prev) => BoardModel.updateColumn(prev, columnId, updated));
        }
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  const handleSubmitCardModal = () => {
    const { mode, columnId, card, title, description } = cardModal;
    if (mode === "create" && columnId) {
      const newCard = CardModel.create(title, description);
      const col = board.columns.find((c) => c.id === columnId);
      if (col) {
        const updated = ColumnModel.addCard(col, newCard);
        setBoard((prev) => BoardModel.updateColumn(prev, columnId, updated));
      }
    } else if (mode === "edit" && card) {
      const updatedCard = CardModel.update(card, { title, description });
      const column = board.columns.find((col) =>
        col.cards.some((c) => c.id === card.id)
      );
      if (column) {
        const updatedCol: Column = {
          ...column,
          cards: column.cards.map((c) => (c.id === card.id ? updatedCard : c)),
        };
        setBoard((prev) =>
          BoardModel.updateColumn(prev, column.id, updatedCol)
        );
      }
    }
    setCardModal({ ...cardModal, isOpen: false });
  };

  // Handlers de coluna
  const handleAddColumn = () => {
    setInputModal({
      isOpen: true,
      title: "Nova Coluna",
      defaultValue: "",
      onConfirm: (title) => {
        const newCol = ColumnModel.create(title);
        setBoard((prev) => BoardModel.addColumn(prev, newCol));
        setInputModal({ ...inputModal, isOpen: false });
      },
    });
  };

  const handleEditColumn = (columnId: string) => {
    const column = board.columns.find((col) => col.id === columnId);
    if (!column) return;

    setInputModal({
      isOpen: true,
      title: "Renomear Coluna",
      defaultValue: column.title,
      onConfirm: (newTitle) => {
        const updated = ColumnModel.updateTitle(column, newTitle);
        setBoard((prev) => BoardModel.updateColumn(prev, columnId, updated));
        setInputModal({ ...inputModal, isOpen: false });
      },
    });
  };

  const handleColumnDrop = useCallback(
    (toIndex: number) => {
      if (!dragState.draggedItem || dragState.draggedItem.type !== "column")
        return;

      const fromIndex = dragState.draggedItem.sourceIndex;
      if (fromIndex !== undefined && fromIndex !== toIndex) {
        setBoard((prevBoard) =>
          BoardModel.moveColumn(prevBoard, fromIndex, toIndex)
        );
      }

      setDragState({
        draggedItem: null,
        dragOverColumn: null,
        dragOverIndex: null,
        dragOutside: false,
      });
    },
    [dragState.draggedItem]
  );

  const handleColumnDragStart = (columnId: string, index: number) => {
    setDragState({
      draggedItem: { type: "column", id: columnId, sourceIndex: index },
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false,
    });
  };

  const handleColumnDragEnd = () => {
    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false,
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    setConfirmationModal({
      isOpen: true,
      message: "Tem certeza que deseja excluir esta coluna?",
      onConfirm: () => {
        setBoard((prev) => BoardModel.removeColumn(prev, columnId));
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  // Drag and drop
  const handleCardDragStart = useCallback(
    (cardId: string, columnId: string, index: number) => {
      setDragState({
        draggedItem: {
          type: "card",
          id: cardId,
          sourceColumnId: columnId,
          sourceIndex: index,
        },
        dragOverColumn: null,
        dragOverIndex: null,
        dragOutside: false,
      });
    },
    []
  );

  const handleCardDragEnd = useCallback(() => {
    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false,
    });
  }, []);

  const handleDropZoneDrop = useCallback(
    (columnId: string, index: number) => {
      if (!dragState.draggedItem || dragState.draggedItem.type !== "card")
        return;
      const { id: cardId, sourceColumnId } = dragState.draggedItem;
      if (!sourceColumnId) return;
      setBoard((prev) =>
        BoardModel.moveCard(prev, cardId, sourceColumnId, columnId, index)
      );
      setDragState({
        draggedItem: null,
        dragOverColumn: null,
        dragOverIndex: null,
        dragOutside: false,
      });
    },
    [dragState.draggedItem]
  );

  // Handlers de UI (drag/drop)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedItem) return;

      const boardElement = boardRef.current;
      if (!boardElement) return;

      const boardRect = boardElement.getBoundingClientRect();
      const isOutside =
        e.clientX < boardRect.left ||
        e.clientX > boardRect.right ||
        e.clientY < boardRect.top ||
        e.clientY > boardRect.bottom;

      setDragState((prev) => ({
        ...prev,
        dragOutside: isOutside,
      }));

      // Find column and position for cards
      if (dragState.draggedItem.type === "card") {
        const columns = document.querySelectorAll("[data-column-id]");
        let overColumn: string | null = null;
        let overIndex: number | null = null;

        columns.forEach((col) => {
          const rect = col.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            overColumn = col.getAttribute("data-column-id");

            // Lógica de posicionamento do drag
            const cards = col.querySelectorAll("[data-card-index]");
            overIndex = 0;

            cards.forEach((card, index) => {
              const cardRect = card.getBoundingClientRect();
              if (e.clientY > cardRect.top + cardRect.height / 2) {
                overIndex = index + 1;
              }
            });
          }
        });

        setDragState((prev) => ({
          ...prev,
          dragOverColumn: overColumn,
          dragOverIndex: overIndex,
        }));
      }
    },
    [dragState.draggedItem]
  );

  // Trash drop handler
  const handleTrashDrop = useCallback(() => {
    if (!dragState.draggedItem) return;

    if (dragState.draggedItem.type === "card") {
      setBoard((prevBoard) =>
        BoardModel.removeCard(prevBoard, dragState.draggedItem!.id)
      );
    } else if (dragState.draggedItem.type === "column") {
      setBoard((prevBoard) =>
        BoardModel.removeColumn(prevBoard, dragState.draggedItem!.id)
      );
    }

    setDragState({
      draggedItem: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dragOutside: false,
    });
  }, [dragState.draggedItem]);

  // Efeitos
  React.useEffect(() => {
    if (dragState.draggedItem) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [dragState.draggedItem, handleMouseMove]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="w-screen px-4" ref={boardRef}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Meu Kanban Board</h1>
          <button
            onClick={handleAddColumn}
            className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-gray-800 z-50"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Coluna
          </button>
        </div>

        <div className="flex gap-6 pb-4 overflow-x-auto whitespace-nowrap">
          <ColumnDropZone
            index={0}
            isActive={
              dragState.draggedItem?.type === "column" &&
              dragState.dragOverIndex === 0
            }
            onDrop={(dropIndex) => {
              if (
                dragState.draggedItem?.type === "column" &&
                typeof dragState.draggedItem.sourceIndex === "number"
              ) {
                setBoard((prev) =>
                  BoardModel.moveColumn(
                    prev,
                    dragState.draggedItem!.sourceIndex!,
                    dropIndex
                  )
                );
                handleColumnDragEnd();
              }
            }}
            onDragOver={(hoverIndex) => {
              if (dragState.draggedItem?.type === "column") {
                setDragState((prev) => ({
                  ...prev,
                  dragOverIndex: hoverIndex,
                }));
              }
            }}
          />

          {board.columns.map((column, index) => (
            <React.Fragment key={column.id}>
              <div className="w-[320px] shrink-0" data-column-id={column.id}>
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
                isActive={
                  dragState.draggedItem?.type === "column" &&
                  dragState.dragOverIndex === index + 1
                }
                onDrop={(dropIndex) => {
                  if (
                    dragState.draggedItem?.type === "column" &&
                    typeof dragState.draggedItem.sourceIndex === "number"
                  ) {
                    setBoard((prev) =>
                      BoardModel.moveColumn(
                        prev,
                        dragState.draggedItem!.sourceIndex!,
                        dropIndex
                      )
                    );
                    handleColumnDragEnd();
                  }
                }}
                onDragOver={(hoverIndex) => {
                  if (dragState.draggedItem?.type === "column") {
                    setDragState((prev) => ({
                      ...prev,
                      dragOverIndex: hoverIndex,
                    }));
                  }
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {dragState.draggedItem && (
        <TrashZone isActive={dragState.dragOutside} onDrop={handleTrashDrop} />
      )}

      {/* Modais */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
      />

      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        defaultValue={inputModal.defaultValue}
        onConfirm={inputModal.onConfirm}
        onCancel={() => setInputModal({ ...inputModal, isOpen: false })}
      />

      <Modal
        isOpen={cardModal.isOpen}
        title={cardModal.mode === "edit" ? "Editar Cartão" : "Novo Cartão"}
        onClose={() => setCardModal({ ...cardModal, isOpen: false })}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={cardModal.title}
              onChange={(e) =>
                setCardModal((prev) => ({ ...prev, title: e.target.value }))
              }
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
              value={cardModal.description}
              onChange={(e) =>
                setCardModal((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Digite a descrição do cartão"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setCardModal({ ...cardModal, isOpen: false })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitCardModal}
              disabled={!cardModal.title.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {cardModal.mode === "edit" ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Board;
