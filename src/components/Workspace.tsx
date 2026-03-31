/* Canvas component inits PIXI Application (root container) */
import { Application, extend, useApplication } from "@pixi/react"
import * as PIXI from 'pixi.js'
import { useEffect, useRef } from "react"
import { Scene } from "./Scene"
import { useSelection } from "../hooks/useSelection"
import type { CanvasImage } from "../types/CanvasImage"

extend({
  Container: PIXI.Container,
})

type WorkspaceProps = {
  images: CanvasImage[]
}

export default function Workspace({ images }: WorkspaceProps) {
  //console.log('Canvas received images:', images) TODO this line is called twice - maybe fix is needed
  const containerRef = useRef<PIXI.Container>(null)

  const {
    selectedId,
    multiSelectedIds,
    select,
    isSelected
  } = useSelection()

  return (
    <div className="canvas-container">
      <Application // Background
        width={1600} 
        height={1200} 
        background={0x676767}
        sharedTicker={true}
      >
        <Scene
          images={images}
          selectedId={selectedId}
          multiSelectedIds={multiSelectedIds}
          containerRef={containerRef}
          onSelect={select}
        />
      </Application>
    </div>
  )
}