"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import DragItem from "@/components/ui/dragItem";
import { AddItemButton } from "@/components/ui/addItemButton";
import { useConstructor } from "@/hooks/useConstructor";
import { EditorWindow } from "@/components/editor/EditorWindow";

export default function Editor() {
  const { blocks, setBlocks } = useConstructor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleEdit = () => {
    if (!activeBlock) return;
    setEditingId(activeBlock.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleCloseModal = () => {
    setEditingId(null);
  };
  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Редактор курса</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <DragItem
                key={block.id}
                block={block}
                onEdit={setEditingId}
                onDelete={(id) =>
                  setBlocks((prev) => prev.filter((b) => b.id !== id))
                }
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.5" } },
            }),
          }}
        >
          {activeId && activeBlock ? (
            <div className="cursor-grabbing">
              <DragItem
                block={activeBlock}
                onEdit={handleEdit}
                onDelete={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddItemButton />

      {editingId && (
        <EditorWindow
          isOpen={!!editingId}
          onClose={handleCloseModal}
          id={editingId}
        />
      )}
    </div>
  );
}
