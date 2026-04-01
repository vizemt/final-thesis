import { Application, extend } from "@pixi/react"
import * as PIXI from 'pixi.js'
import { useRef } from "react"
import { Scene } from "./Scene"
import type { CanvasImage } from "../types/CanvasImage"

extend({
  Container: PIXI.Container,
})

type WorkspaceProps = {
  images: CanvasImage[]
  selectedId: string | null
  multiSelectedIds: Set<string>
  onSelect: (id: string, multi: boolean) => void
  onImageDelete: (id: string) => void
}

export default function Workspace({ 
  images, 
  selectedId, 
  multiSelectedIds, 
  onSelect,
  onImageDelete 
}: WorkspaceProps) {
  const containerRef = useRef<PIXI.Container>(null)

  return (
    <div className="canvas-container">
      <Application
        width={1800} 
        height={1300} 
        background={0x676767}
        sharedTicker={true}
        
      >
        <Scene
          images={images}
          selectedId={selectedId}
          multiSelectedIds={multiSelectedIds}
          containerRef={containerRef}
          onSelect={onSelect}
          onImageDelete={onImageDelete}
        />
      </Application>
    </div>
  )
}