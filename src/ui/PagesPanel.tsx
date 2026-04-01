import { usePages } from '../hooks/usePages'
import { Plus, Copy, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'

type PagesPanelProps = {
  pages: ReturnType<typeof usePages>
}

export default function PagesPanel({ pages }: PagesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleRename = (pageId: string) => {
    if (editName.trim()) {
      pages.renamePage(pageId, editName.trim())
    }
    setEditingId(null)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex !== dropIndex) {
      pages.reorderPages(dragIndex, dropIndex)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Pages</h3>
        <button 
          onClick={() => pages.addPage()}
        >
          + Add page
        </button>
      </div>

      <div className="panel-content">
        <div className="item-list">
          {pages.pages.map((page, index) => (
            <div
              key={page.id}
              className={`item ${pages.activePageId === page.id ? 'active' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => pages.setActivePageId(page.id)}
            >
              <div className="item-info">
                {editingId === page.id ? (
                  <input
                    type="text"
                    className="item-edit-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(page.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="item-title">{page.name}</span>
                    <span className="item-subtitle">{page.images.length} items</span>
                  </>
                )}
              </div>

              <div className="item-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingId(page.id)
                    setEditName(page.name)
                  }}
                  title="Rename"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    pages.duplicatePage(page.id)
                  }}
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                {pages.pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      pages.deletePage(page.id)
                    }}
                    title="Delete"
                    className="delete-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}