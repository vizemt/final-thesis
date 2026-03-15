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
  onAddLayer: () => void
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
  onAddLayer
}) => {
  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h3>Layers</h3>
        <button onClick={onAddLayer}>+ Add Layer</button>
      </div>
      
      <div className="layer-list">
        {layers.sort((a, b) => b.zIndex - a.zIndex).map(layer => (
          <div
            key={layer.id}
            className={`layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
            onClick={() => onSelectLayer(layer.id)}
          >
            <div className="layer-controls">
              <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}>
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              
              <button onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}>
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
              />
              
              <button onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'up'); }}>
                <ArrowUp size={16} />
              </button>
              
              <button onClick={(e) => { e.stopPropagation(); onMoveLayer(layer.id, 'down'); }}>
                <ArrowDown size={16} />
              </button>
              
              {layer.id !== 'default' && (
                <button onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}