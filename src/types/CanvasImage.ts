import type { Layer } from "./Layer"

export interface CanvasImage {
  id: string
  texture: string
  y?: number            // If no position here, drop image on the center
  x?: number
  width?: number        // Width for scaling
  height?: number       // Height for scaling
  rotation?: number     // Rotation in radians
  scale?: {             // Scale factor
    x: number
    y: number
  }
  originalWidth?: number  // Store original dimensions
  originalHeight?: number
  layer: Layer
}