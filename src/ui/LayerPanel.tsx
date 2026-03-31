import React from 'react'
import type { Layer } from '../types/Layer'
import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

type LayerPanelProps = {
  layers: Layer[]
  activeLayerId: string
  onSelectLayer: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onToggleLock: (layerId: string) => void
  onRemoveLayer: (layerId: string) => void
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void
  onOpacityChange: (layerId: string, opacity: number) => void
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRemoveLayer,
  onMoveLayer,
  onOpacityChange,
}) => {
  // Sort layers by zIndex descending for display (highest zIndex on top)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h3>Layers</h3>
        <button 
          onClick={() => {
            // TODO implement masks
          }}
        >
          button here
        </button>
      </div>
      
      <div className="layer-list">
        {sortedLayers.map(layer => {
          // Determine if layer can be moved up (not the highest zIndex)
          const isHighest = layer.id !== 'default' && 
            Math.max(...layers.filter(l => l.id !== 'default').map(l => l.zIndex)) === layer.zIndex
          
          // Determine if layer can be moved down (not the lowest above default)
          const nonDefaultLayers = layers.filter(l => l.id !== 'default')
          const lowestNonDefaultZIndex = nonDefaultLayers.length > 0 
            ? Math.min(...nonDefaultLayers.map(l => l.zIndex))
            : 0
          const isLowest = layer.id !== 'default' && layer.zIndex === lowestNonDefaultZIndex

          return (
            <div
              key={layer.id}
              className={`layer-item ${activeLayerId === layer.id ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="layer-controls">
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
                
                <span className="layer-name">{layer.name}</span>
              </div>
              
              <div className="layer-actions">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={layer.opacity}
                  onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  disabled={layer.locked}
                />
                
                {layer.id !== 'default' && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'up'); }}
                      className="layer-move-btn"
                      disabled={isHighest}
                      title={isHighest ? "Already at top" : "Move up"}
                    >
                      <ArrowUp size={16} />
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'down'); }}
                      className="layer-move-btn"
                      disabled={isLowest}
                      title={isLowest ? "Already at bottom" : "Move down"}
                    >
                      <ArrowDown size={16} />
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                      className="layer-delete-btn"
                      title="Delete layer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}