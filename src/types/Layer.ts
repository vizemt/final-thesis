import type { BLEND_MODES } from 'pixi.js'
import type { CanvasImage } from './CanvasImage'
import type { GraphicsItem } from './GraphicsItem'

export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode?: BLEND_MODES
  groupId?: string
  zIndex: number
  locked?: boolean
  items?: (CanvasImage | GraphicsItem | Layer)[]
}

export interface LayerGroup {
  id: string
  name: string
  layers: string[]
}