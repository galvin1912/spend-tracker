import { useState, useEffect, useMemo } from "react";
import { Input } from "antd";
import { Search } from "@styled-icons/boxicons-regular";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../../features/notes/notesActions";
import { debounce } from "lodash";

const NotesSearch = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.notes.searchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search dispatch
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        dispatch(setSearchQuery(query));
      }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(localQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [localQuery, debouncedSearch]);

  return (
    <Input
      placeholder="Tìm kiếm ghi chú..."
      prefix={<Search size="16" />}
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
      allowClear
      style={{ marginBottom: "16px" }}
    />
  );
};

export default NotesSearch;
