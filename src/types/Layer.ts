import type { BLEND_MODES } from 'pixi.js'

export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode?: BLEND_MODES
  groupId?: string
  zIndex: number
  locked?: boolean
}

export interface LayerGroup {
  id: string
  name: string
  layers: string[] // layer IDs
}