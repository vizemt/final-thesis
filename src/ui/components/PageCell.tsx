import { useState } from "react";
import type { Page } from "../../types/Page";

interface PageCellProps {
  page: Page;
  isRoot: boolean;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
}
 
export function PageCell({
  page,
  isRoot,
  isActive,
  onSelect,
  onRename,
}: PageCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.name);
 
  const commitRename = () => {
    setEditing(false);
    if (draft.trim() && draft !== page.name) onRename(draft.trim());
  };
 
  return (
    <td
      className={`plotgrid-cell${isActive ? " plotgrid-cell--active" : ""}`}
      onClick={onSelect}
    >
      {editing ? (
        <input
          className="plotgrid-rename"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(page.name); setEditing(false); }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="plotgrid-title"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          title="Double-click to rename"
        >
          {page.name}
        </div>
      )}
      <div className="plotgrid-actions" onClick={(e) => e.stopPropagation()}>
      </div>
    </td>
  );
}