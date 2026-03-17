import type { Transformer } from '@pixi-essentials/transformer';

export interface TransformHandle {
  // Keep this for compatibility, but we'll use transformer directly
}

export interface TransformState {
  id: string
  transformer?: Transformer
}

export type TransformHandleType = 
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'top' | 'right' | 'bottom' | 'left'
  | 'rotate'