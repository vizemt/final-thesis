import React, { useState } from 'react'
import type { Layer } from '../types/Layer'
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react'

type LayerPanelProps = {
  layers: Layer[]
  activeLayerId: string
  onSelectLayer: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onToggleLock: (layerId: string) => void
  onRemoveLayer: (layerId: string) => void
  onOpacityChange: (layerId: string, opacity: number) => void
  onReorderLayers: (draggedLayerId: string, targetLayerId: string) => void
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
  onOpacityChange,
  onReorderLayers,
}) => {
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null)

  // Sort layers by zIndex descending for display (highest zIndex on top)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    e.dataTransfer.setData('text/plain', layerId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverLayerId(layerId)
  }

  const handleDragLeave = () => {
    setDragOverLayerId(null)
  }

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault()
    const draggedLayerId = e.dataTransfer.getData('text/plain')
    
    if (draggedLayerId !== targetLayerId) {
      onReorderLayers(draggedLayerId, targetLayerId)
    }
    
    setDragOverLayerId(null)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Layers</h3>
      </div>
      
      <div className="panel-content">
        <div className="item-list">
          {sortedLayers.map(layer => {
            return (
              <div
                key={layer.id}
                className={`item layer-item ${activeLayerId === layer.id ? 'active' : ''} ${layer.locked ? 'locked' : ''} ${dragOverLayerId === layer.id ? 'drag-over' : ''}`}
                onClick={() => onSelectLayer(layer.id)}
                draggable={!layer.locked && layer.id !== 'default'}
                onDragStart={(e) => handleDragStart(e, layer.id)}
                onDragOver={(e) => handleDragOver(e, layer.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, layer.id)}
              >
                <div className="layer-controls">
                  {/* Drag handle */}
                  {layer.id !== 'default' && !layer.locked && (
                    <div 
                      className="drag-handle"
                      style={{ cursor: 'grab', marginRight: '8px', display: 'flex', alignItems: 'center' }}
                      onDragStart={(e) => handleDragStart(e, layer.id)}
                    >
                      <GripVertical size={16} />
                    </div>
                  )}
                  
                  <span className="layer-name">{layer.name}</span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                    className="layer-btn"
                  >
                    {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                    className="layer-btn"
                  >
                    {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                </div>
                
                <div className="layer-actions">
                  {layer.id !== 'default' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                      className="delete-btn"
                      title="Delete layer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}