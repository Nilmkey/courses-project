import React, { useCallback, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";
import "@/styles/editor.css";
import { BlockContent } from "@/types/types";

interface EditorProps {
  content: BlockContent | undefined;
  onUpdate: (markdown: BlockContent) => void;
}

const CrepeEditor: React.FC<EditorProps> = ({ content, onUpdate }) => {
  // Используем useRef чтобы избежать пересоздания редактора
  const crepeRef = useRef<Crepe | null>(null);
  //   const isInitialMount = useRef(true);

  useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: content
          ? content.text
          : "Тут нет текста но ты можешь написать его!!!",
        // features: {
        //   [Crepe.Feature.BlockEdit]: false,
        // },
      });

      crepe.create().then(() => {
        crepeRef.current = crepe;

        crepe.on((listener) => {
          listener.markdownUpdated((ctx, markdown) => {
            onUpdate({ text: markdown });
          });
        });
      });

      return crepe;
    },
    [], // Пустой массив зависимостей - инициализируем только один раз
  );

  return <Milkdown />;
};

export const MilkdownEditorWrapper: React.FC<EditorProps> = (props) => {
  return (
    <div className="my-editor-container">
      <MilkdownProvider>
        <CrepeEditor {...props} />
      </MilkdownProvider>
    </div>
  );
};
