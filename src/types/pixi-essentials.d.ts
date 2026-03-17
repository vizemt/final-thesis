import { Container, DisplayObject } from 'pixi.js';

declare module '@pixi-essentials/transformer' {
  export interface ITransformerHandleStyle {
    fill?: number;
    stroke?: number;
    strokeWidth?: number;
  }

  export interface ITransformerOptions {
    group?: Container[];
    stage?: Container;
    scaleEnabled?: boolean;
    rotateEnabled?: boolean;
    translateEnabled?: boolean;
    lockAspectRatio?: boolean;
    boxScalingEnabled?: boolean;
    centeredScaling?: boolean;
    rotationSnap?: number;
    scaleSnap?: number;
    handleStyle?: ITransformerHandleStyle;
    wireframeStyle?: {
      stroke?: number;
      strokeWidth?: number;
    };
  }

  export class Transformer extends Container {
    constructor(options?: ITransformerOptions);
    group: Container[];
    scaleEnabled: boolean;
    rotateEnabled: boolean;
    translateEnabled: boolean;
    lockAspectRatio: boolean;
    boxScalingEnabled: boolean;
    centeredScaling: boolean;
    destroy(): void;
  }
}