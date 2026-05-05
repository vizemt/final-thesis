import { Copy, Trash2, Edit2, GitBranch, Plus, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Page } from '../types/Page'

type PagesPanelProps = {
  rootPage: Page
  activePageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => string
  onAddBranch: (parentId: string) => void
  onDuplicatePage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onRenamePage: (pageId: string, newName: string) => void
}

type PageNodeProps = {
  page: Page
  depth: number
  activePageId: string
  totalPages: number
  editingId: string | null
  editName: string
  onSelectPage: (id: string) => void
  onAddBranch: (parentId: string) => void
  onDuplicatePage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onStartRename: (page: Page) => void
  onCommitRename: (pageId: string) => void
  onCancelRename: () => void
  onEditNameChange: (name: string) => void
}

function PageNode({
  page,
  depth,
  activePageId,
  totalPages,
  editingId,
  editName,
  onSelectPage,
  onAddBranch,
  onDuplicatePage,
  onDeletePage,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onEditNameChange,
}: PageNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = page.childrenPages.length > 0
  const isActive = activePageId === page.id
  const isEditing = editingId === page.id

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 12 }}>
      {/* Branch connector line */}
      <div style={{ position: 'relative' }}>
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: -12,
            top: 0,
            bottom: 0,
            width: 1,
            background: 'var(--color-border-tertiary)',
          }} />
        )}

        <div
          className={`item ${isActive ? 'active' : ''}`}
          onClick={() => onSelectPage(page.id)}
          style={{ paddingLeft: 4 }}
        >
          {/* Expand/collapse toggle */}
          <button
            style={{
              visibility: hasChildren ? 'visible' : 'hidden',
              background: 'none',
              border: 'none',
              padding: '0 2px',
              cursor: 'pointer',
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(v => !v)
            }}
          >
            <ChevronRight
              size={12}
              style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          <div className="item-info" style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <input
                type="text"
                className="item-edit-input"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onBlur={() => onCommitRename(page.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCommitRename(page.id)
                  if (e.key === 'Escape') onCancelRename()
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="item-title" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {page.name}
                </span>
                <span className="item-subtitle">
                  {page.images?.length ?? 0} items
                  {hasChildren && ` · ${page.childrenPages.length} branch${page.childrenPages.length !== 1 ? 'es' : ''}`}
                </span>
              </>
            )}
          </div>

          <div className="item-actions">
            <button
              onClick={(e) => { e.stopPropagation(); onAddBranch(page.id) }}
              title="Add branch"
            >
              <GitBranch size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStartRename(page) }}
              title="Rename"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicatePage(page.id) }}
              title="Duplicate"
            >
              <Copy size={14} />
            </button>
            {totalPages > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePage(page.id) }}
                title="Delete"
                className="delete-btn"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div style={{ position: 'relative' }}>
          {/* Vertical guide line for this level */}
          <div style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 1,
            background: 'var(--color-border-tertiary)',
            pointerEvents: 'none',
          }} />
          {page.childrenPages.map(child => (
            <PageNode
              key={child.id}
              page={child}
              depth={depth + 1}
              activePageId={activePageId}
              totalPages={totalPages}
              editingId={editingId}
              editName={editName}
              onSelectPage={onSelectPage}
              onAddBranch={onAddBranch}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
              onStartRename={onStartRename}
              onCommitRename={onCommitRename}
              onCancelRename={onCancelRename}
              onEditNameChange={onEditNameChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function countPages(page: Page): number {
  return 1 + page.childrenPages.reduce((n, c) => n + countPages(c), 0)
}

export default function PagesPanel({
  rootPage,
  activePageId,
  onSelectPage,
  onAddPage,
  onAddBranch,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
}: PagesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const totalPages = countPages(rootPage)

  const handleStartRename = (page: Page) => {
    setEditingId(page.id)
    setEditName(page.name)
  }

  const handleCommitRename = (pageId: string) => {
    if (editName.trim()) onRenamePage(pageId, editName.trim())
    setEditingId(null)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Pages</h3>
        <button onClick={() => onAddPage()}>
          <Plus size={14} /> Add page
        </button>
      </div>

      <div className="panel-content">
        <div className="item-list">
          <PageNode
            page={rootPage}
            depth={0}
            activePageId={activePageId}
            totalPages={totalPages}
            editingId={editingId}
            editName={editName}
            onSelectPage={onSelectPage}
            onAddBranch={onAddBranch}
            onDuplicatePage={onDuplicatePage}
            onDeletePage={onDeletePage}
            onStartRename={handleStartRename}
            onCommitRename={handleCommitRename}
            onCancelRename={() => setEditingId(null)}
            onEditNameChange={setEditName}
          />
        </div>
      </div>
    </div>
  )
}