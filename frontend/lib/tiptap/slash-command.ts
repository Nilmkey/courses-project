import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import { SlashCommandMenu } from "@/components/editor/SlashCommand";

export interface SlashCommandOptions {
  suggestion: {
    char: string;
    command: (props: any) => void;
  };
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: () => {},
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.suggestion.char,
        pluginKey: "slashCommand",
        command: this.options.suggestion.command,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const isRootDepth = $from.depth === 1;
          const isParagraph = $from.parent.type.name === "paragraph";
          const isStartOfNode = $from.parent.textContent?.charAt(0) === "/";

          return isRootDepth && isParagraph && isStartOfNode;
        },
        render: () => {
          let component: ReactRenderer;
          let popup: Instance | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }

              return component.ref?.onKeyDown(props);
            },

            onExit() {
              popup?.[0]?.destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
