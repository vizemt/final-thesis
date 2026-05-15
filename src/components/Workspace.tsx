import { Application, extend } from "@pixi/react"
import * as PIXI from 'pixi.js'
import { useMemo, useRef } from "react"
import { PageScene } from "./PageScene"
import type { CanvasImage } from "../types/CanvasImage"
import Canvas from "./Canvas"
import type { GraphicsItem } from "../types/GraphicsItem"
import type { Hotspot } from "../types/Hotspot"
// todo include resize controllers

extend({
  Container: PIXI.Container,
})

type WorkspaceProps = {
  readonly: boolean
  hotspots: Hotspot[]
  images: (CanvasImage | GraphicsItem)[]
  selectedId: string | null
  multiSelectedIds: Set<string>
  onExit: () => void
  onHotspotAction: (action) => void
  onSelect: (id: string, multi: boolean) => void
  onImageDelete: (id: string) => void
  onImageUpdate: (imageId: string, updates: CanvasImage) => void
  canvasParams: {
    width: number,
    height: number,
    color: number,
    cornerRadius: number,}
}

export default function Workspace({ 
  readonly,
  images, 
  selectedId, 
  multiSelectedIds, 
  onExit,
  onHotspotAction,
  onSelect,
  onImageDelete,
  onImageUpdate,
  canvasParams 
}: WorkspaceProps) {
  const containerRef = useRef<PIXI.Container>(null)

    // Workspace dimensions
  const workspaceWidth = 3500
  const workspaceHeight = 2800

  // Calculate center position
  const canvasX = useMemo(() => {
    return (workspaceWidth - canvasParams.width) / 2
  }, [workspaceWidth, canvasParams.width])
  
  const canvasY = useMemo(() => {
    return (workspaceHeight - canvasParams.height) / 2
  }, [workspaceHeight, canvasParams.height])

  return (
    <div className="canvas-wrapper">
      <Application
        width={workspaceWidth} 
        height={workspaceHeight} 
        background={0x676767}
        sharedTicker={true}
      >
        <Canvas
          x={canvasX}
          y={canvasY} 
          width={canvasParams.width}
          height={canvasParams.height}
          color={canvasParams.color}
          cornerRadius={canvasParams.cornerRadius}
        />
        <PageScene
          images={images}
          canvasX={(canvasX + canvasParams.width) / 2}
          canvasY={(canvasY + canvasParams.height) / 2}
          selectedId={selectedId}
          multiSelectedIds={multiSelectedIds}
          containerRef={containerRef}
          onSelect={onSelect}
          onImageDelete={onImageDelete}
          onImageUpdate={onImageUpdate}
        />
      </Application>
    
    </div>
  )
}