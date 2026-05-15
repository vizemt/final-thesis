import { Download, Import, View } from "lucide-react"

type Props = {
    onModeChange: () => void 
}

export default function ExportPanel({
    onModeChange
}: Props) {
    return <div className="panel">
        <div className="panel-header">
            <h3>Export</h3>
        </div>
        <div className="panel-content">
            <button
                onClick={onModeChange}
            >
                <View size={16} />
                <span>Preview</span>
            </button>
            <button
            >
                <Download size={16} />
                <span>Export</span>
            </button>
            <button
            >
                <Import size={16} />
                <span>Import</span>
            </button>
        </div>
    </div>
}