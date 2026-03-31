import type { Layer } from "./Layer"

export interface CanvasImage {
  id: string
  texture: string
  x: number
  y: number
  width?: number        // Add width for scaling
  height?: number       // Add height for scaling
  rotation?: number     // Add rotation in radians
  scale?: {             // Add scale factor
    x: number
    y: number
  }
  originalWidth?: number  // Store original dimensions
  originalHeight?: number
  layer: Layer
}