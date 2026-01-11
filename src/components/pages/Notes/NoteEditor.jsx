import { useEffect, useMemo, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Input, Button } from "antd";
import { CheckSquare } from "@styled-icons/boxicons-regular";
import { useDispatch, useSelector } from "react-redux";
import { updateNote, setSaveStatus, forceSyncNote, createNote } from "../../../features/notes/notesActions";
import { debounce } from "lodash";
import store from "../../../store";
import SaveStatus from "./SaveStatus";
import PropTypes from "prop-types";
import "./NoteEditor.css";

const NoteEditor = ({ noteId = null }) => {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.notes);
  const saveStatuses = useSelector((state) => state.notes.saveStatus);
  const note = noteId ? notes[noteId] : null;
  const saveStatus = noteId ? saveStatuses[noteId] : null;
  const [titleValue, setTitleValue] = useState(note?.title || "");
  const isReorderingRef = useRef(false);

  // Update title value when note changes
  useEffect(() => {
    if (note?.title !== undefined) {
      setTitleValue(note.title);
    }
  }, [note?.title]);

  // Debounced save function for content
  const debouncedSave = useMemo(
    () =>
      debounce(async (content, targetNoteId) => {
        const id = targetNoteId || noteId;
        if (!id) return;

        // Get note from store state
        const storeState = store.getState();
        const note = storeState.notes.notes[id];
        if (!note) return;

        // Check if content actually changed
        const currentContent = JSON.stringify(note.content);
        const newContent = JSON.stringify(content);
        
        if (currentContent === newContent) {
          return; // No change, skip save
        }

        dispatch(setSaveStatus(id, "saving"));

        try {
          await dispatch(updateNote(id, { content }));
        } catch (error) {
          console.error("Failed to save note:", error);
          dispatch(setSaveStatus(id, "error"));
        }
      }, 800),
    [noteId, dispatch]
  );

  // Debounced save function for title
  const debouncedSaveTitle = useMemo(
    () =>
      debounce(async (title, targetNoteId) => {
        const id = targetNoteId || noteId;
        if (!id) return;

        const storeState = store.getState();
        const currentNote = storeState.notes.notes[id];
        if (!currentNote) return;

        if (currentNote.title === title) {
          return; // No change, skip save
        }

        dispatch(setSaveStatus(id, "saving"));

        try {
          await dispatch(updateNote(id, { title }));
        } catch (error) {
          console.error("Failed to save note title:", error);
          dispatch(setSaveStatus(id, "error"));
        }
      }, 800),
    [noteId, dispatch]
  );

  // Function to reorder task items: unchecked first, checked last
  const reorderTaskItems = (doc) => {
    if (!doc || !doc.content) return doc;

    const reorderTasksInNode = (node) => {
      if (node.type === "taskList") {
        const unchecked = [];
        const checked = [];

        // Separate checked and unchecked items
        node.content.forEach((item) => {
          if (item.type === "taskItem") {
            if (item.attrs?.checked) {
              checked.push(item);
            } else {
              unchecked.push(item);
            }
          } else {
            // Keep non-task items in their original position
            unchecked.push(item);
          }
        });

        // Reorder: unchecked first, then checked
        return {
          ...node,
          content: [...unchecked, ...checked],
        };
      }

      // Recursively process child nodes
      if (node.content && Array.isArray(node.content)) {
        return {
          ...node,
          content: node.content.map(reorderTasksInNode),
        };
      }

      return node;
    };

    return reorderTasksInNode(doc);
  };

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu gõ để tạo ghi chú mới...",
      }),
    ],
    content: note?.content || {
      type: "doc",
      content: [],
    },
    onUpdate: ({ editor }) => {
      // Check if any task item was checked/unchecked
      const currentContent = editor.getJSON();
      let shouldReorder = false;

      // Check if we need to reorder (if any task items exist)
      const checkForTaskItems = (node) => {
        if (node.type === "taskList" && node.content) {
          const hasChecked = node.content.some(
            (item) => item.type === "taskItem" && item.attrs?.checked
          );
          const hasUnchecked = node.content.some(
            (item) => item.type === "taskItem" && !item.attrs?.checked
          );
          if (hasChecked && hasUnchecked) {
            shouldReorder = true;
          }
        }
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(checkForTaskItems);
        }
      };

      checkForTaskItems(currentContent);

      // Reorder if needed and not already reordering
      if (shouldReorder && !isReorderingRef.current) {
        isReorderingRef.current = true;
        const reorderedContent = reorderTaskItems(currentContent);
        editor.commands.setContent(reorderedContent);
        // Use setTimeout to allow the editor to update before saving
        setTimeout(() => {
          isReorderingRef.current = false;
        }, 100);
      } else {
        isReorderingRef.current = false;
      }

      const content = editor.getJSON();
      
      // Auto-create note if user starts typing and no note exists
      if (!noteId && editor.getText().trim()) {
        dispatch(createNote()).then((action) => {
          if (action.payload && action.payload.id) {
            // Note created, save the content
            debouncedSave(content, action.payload.id);
          }
        });
        return;
      }

      if (noteId && !isReorderingRef.current) {
        debouncedSave(content, noteId);
      }
    },
    editorProps: {
      attributes: {
        class: "note-editor-content",
      },
    },
  });

  // Update editor content when note changes
  useEffect(() => {
    if (editor && noteId && note && note.content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const noteContent = JSON.stringify(note.content);
      
      // Only update if content is different (avoid infinite loop)
      if (currentContent !== noteContent) {
        editor.commands.setContent(note.content);
      }
    } else if (editor && !noteId) {
      // Clear editor when no note is selected
      editor.commands.setContent({
        type: "doc",
        content: [],
      });
    }
  }, [editor, note, noteId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event) => {
      // Cmd/Ctrl + S: Force sync
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        if (noteId) {
          dispatch(forceSyncNote(noteId));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, noteId, dispatch]);

  // Handle inserting task list
  const handleInsertTaskList = () => {
    if (!editor) return;
    editor.chain().focus().toggleTaskList().run();
  };

  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitleValue(newTitle);
    if (noteId) {
      debouncedSaveTitle(newTitle, noteId);
    }
  };

  if (!note) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ color: "#8c8c8c" }}>Chọn một ghi chú để chỉnh sửa</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with title input and save status */}
      {(note || saveStatus) && (
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {note && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Input
                value={titleValue}
                onChange={handleTitleChange}
                placeholder="Tiêu đề ghi chú..."
                variant="borderless"
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  padding: 0,
                  flex: 1,
                }}
              />
              {saveStatus && <SaveStatus status={saveStatus} />}
            </div>
          )}
          {note && editor && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                type="text"
                icon={<CheckSquare size="16" />}
                onClick={handleInsertTaskList}
                size="small"
              >
                Thêm checkbox
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px", wordWrap: "break-word", overflowWrap: "break-word" }}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
};

NoteEditor.propTypes = {
  noteId: PropTypes.string,
};

export default NoteEditor;
