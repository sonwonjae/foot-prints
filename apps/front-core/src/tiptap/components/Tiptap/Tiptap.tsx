import CharacterCount from "@tiptap/extension-character-count";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import {
  useEditor,
  EditorContent,
  // BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { cn } from "@/utils/tailwindcss";

interface TiptapProps {
  value: string;
  onChange: (params: { html: string }) => void;
  className?: string;
  placeholder: string;
  editable?: boolean;
  maxLength?: number;
}

function Tiptap({
  value = "",
  onChange = () => {},
  className = "",
  placeholder = "",
  editable = false,
  maxLength,
}: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: maxLength,
      }),
      Document,
      Dropcursor,
      Gapcursor,
      Image,
      Paragraph,
      Placeholder.configure({
        placeholder,
      }),
      Text,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose",
          "prose-sm",
          "sm:prose-sm",
          "lg:prose-base",
          "xl:prose-base",
          "focus:outline-none",
        ),
      },
    },
    content: value,
    onUpdate: ({ editor }) => {
      onChange({ html: editor.getHTML() });
    },
    editable,
  });

  return (
    <>
      <EditorContent
        editor={editor}
        className={cn("w-full", "h-full", className)}
        tabIndex={0}
      />
      {/* {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="bubble-menu">
              <button
                onClick={() => {
                  return editor.chain().focus().toggleBold().run();
                }}
                className={editor.isActive("bold") ? "is-active" : ""}
              >
                Bold
              </button>
              <button
                onClick={() => {
                  return editor.chain().focus().toggleItalic().run();
                }}
                className={editor.isActive("italic") ? "is-active" : ""}
              >
                Italic
              </button>
              <button
                onClick={() => {
                  return editor.chain().focus().toggleStrike().run();
                }}
                className={editor.isActive("strike") ? "is-active" : ""}
              >
                Strike
              </button>
            </div>
          </BubbleMenu>
        )} */}
    </>
  );
}

export default Tiptap;
