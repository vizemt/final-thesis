// Unlike pixel-based image editors, this editor works with pages. 
// The size of these pages defines the main working area, or what might be thought of as the "canvas." 
// Changing this canvas size means changing the dimensions of the pages in your document.

import { extend } from "@pixi/react"
import * as PIXI from 'pixi.js'
import { useCallback } from "react"

extend({
  Graphics: PIXI.Graphics,
})

type CanvasProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  color?: number
  cornerRadius?: number
}

export default function Canvas({ 
  x = 0,
  y = 0,
  width = 700, 
  height = 1200, 
  color = 0xffffff,
  cornerRadius = 0,
}: CanvasProps) {

  const drawCanvas = useCallback((g: PIXI.Graphics) => {
    g.clear()
    
    // Draw filled rectangle
    if (cornerRadius > 0) {
      g.roundRect(x, y, width, height, cornerRadius)
    } else {
      g.rect(x, y, width, height)
    }
    
    // Fill with color
    g.fill({ color })
    
  }, [x, y, width, height, color, cornerRadius])

  return (
    <pixiGraphics draw={drawCanvas} />
  )
}