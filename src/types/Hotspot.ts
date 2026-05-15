export type HotspotAction =
  | { type: 'navigate'; targetPageId: string } // in case other hotspot functions in future

export interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  action: HotspotAction
  label?: string        // editor-only label, e.g. "Go to ending A"
  visible?: boolean     // show outline in editor, invisible in player
}