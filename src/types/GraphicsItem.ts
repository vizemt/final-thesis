import type { Layer } from "./Layer"

export interface GraphicsItem {
  id: string
  x: number
  y: number
  width?: number        // Add width for scaling
  height?: number       // Add height for scaling
  rotation?: number     // Add rotation in radians
  scale?: {             // Add scale factor
    x: number
    y: number
  }
  layer?: Layer
}