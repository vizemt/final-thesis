import type { CanvasImage } from "./CanvasImage"
import type { GraphicsItem } from "./GraphicsItem"
import type { Layer } from "./Layer"

export type Page = {
  id: string
  name: string
  images?: CanvasImage[]
  graphicsItems?: GraphicsItem[]
  layers: Layer[]
  order: number
  thumbnail?: string
  isVisible?: boolean
  isMaster?: boolean
}

export type PageState = {
  pages: Page[]
  activePageId: string
}