import type { CanvasImage } from "./CanvasImage"
import type { GraphicsItem } from "./GraphicsItem"
import type { Hotspot } from "./Hotspot"
import type { Layer } from "./Layer"

export type Page = {
  id: string
  name: string
  parentPageId: string | null // null if this is root page
  childrenPages: Page[]
  images?: CanvasImage[]
  graphicsItems?: GraphicsItem[]
  layers: Layer[]
  order: number
  hotspots: Hotspot[]
  thumbnail?: string
  isVisible?: boolean
  isMaster?: boolean
}

export type PageState = {
  pages: Page[]
  activePageId: string
}