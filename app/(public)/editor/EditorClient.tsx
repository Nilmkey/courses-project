"use client";
import dynamic from "next/dynamic";

const DndEditor = dynamic(() => import("./editorCore"), {
  ssr: false,
  loading: () => <div>Загрузка редактора...</div>,
});

export default function DndPage() {
  return (
    <div className="" onMouseDown={(e) => e.stopPropagation()}>
      <DndEditor></DndEditor>
    </div>
  );
}
