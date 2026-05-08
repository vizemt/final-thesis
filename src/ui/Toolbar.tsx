import { Layers, Image as ImageIcon, FileText, Download } from "lucide-react"
import type { ToolbarItem } from "../types/ToolbarItem"

type Props = {
  activePanel: ToolbarItem
  onPanelChange: (panel: ToolbarItem) => void
}

export default function Toolbar({ activePanel, onPanelChange }: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar-tabs">
        <button 
          className={`tab-button ${activePanel === 'library' ? 'active' : ''}`}
          onClick={() => onPanelChange('library')}
        >
          <ImageIcon size={16} />
          <span>Library</span>
        </button>
        <button 
          className={`tab-button ${activePanel === 'layers' ? 'active' : ''}`}
          onClick={() => onPanelChange('layers')}
        >
          <Layers size={16} />
          <span>Layers</span>
        </button>
        <button 
          className={`tab-button ${activePanel === 'pages' ? 'active' : ''}`}
          onClick={() => onPanelChange('pages')}
        >
          <FileText size={16} />
          <span>Pages</span>
        </button>
        <button 
          className={`tab-button ${activePanel === 'export' ? 'active' : ''}`}
          onClick={() => onPanelChange('export')}
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}