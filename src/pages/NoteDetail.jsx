import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "antd";
import { ArrowBack } from "@styled-icons/boxicons-regular";
import { useSelector } from "react-redux";
import NoteEditor from "../components/pages/Notes/NoteEditor";
import NoteMetadata from "../components/pages/Notes/NoteMetadata";
import store from "../store";

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const note = useSelector((state) => state.notes.notes[noteId]);

  // Redirect to notes list if note doesn't exist
  useEffect(() => {
    if (noteId && note === undefined) {
      // Note might be loading, wait a bit
      const timer = setTimeout(() => {
        const state = store.getState();
        if (!state.notes.notes[noteId]) {
          navigate("/notes", { replace: true });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [noteId, note, navigate]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
      <Helmet
        title={note ? `${note.title || "Untitled"} | Ghi chú | GST` : "Ghi chú | GST"}
        meta={[
          {
            name: "description",
            content: "Chỉnh sửa ghi chú",
          },
        ]}
      />
      
      {/* Header with back button */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Button
          type="text"
          icon={<ArrowBack size="20" />}
          onClick={() => navigate("/notes")}
          style={{ padding: 0, display: "flex", alignItems: "center" }}
        >
          Quay lại
        </Button>
      </div>

      {/* Note Metadata */}
      {noteId && <NoteMetadata noteId={noteId} />}

      {/* Editor */}
      <div style={{ flex: 1, overflow: "hidden", backgroundColor: "#fff" }}>
        <NoteEditor noteId={noteId} />
      </div>
    </div>
  );
};

export default NoteDetail;
