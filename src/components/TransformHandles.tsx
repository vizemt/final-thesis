import * as PIXI from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import { extend } from '@pixi/react';

extend({
  Graphics: PIXI.Graphics,
  Container: PIXI.Container,
});

const HANDLE_SIZE = 8;
const ROTATE_OFFSET = 24;
const HANDLE_COLOR = 0xffffff;
const BORDER_COLOR = 0x4A90E2;
const ROTATE_COLOR = 0x4A90E2;

const RESIZE_HANDLES = [
  { id: 'nw', rx: -0.5, ry: -0.5, cursor: 'nw-resize' },
  { id: 'n', rx: 0, ry: -0.5, cursor: 'n-resize' },
  { id: 'ne', rx: 0.5, ry: -0.5, cursor: 'ne-resize' },
  { id: 'e', rx: 0.5, ry: 0, cursor: 'e-resize' },
  { id: 'se', rx: 0.5, ry: 0.5, cursor: 'se-resize' },
  { id: 's', rx: 0, ry: 0.5, cursor: 's-resize' },
  { id: 'sw', rx: -0.5, ry: 0.5, cursor: 'sw-resize' },
  { id: 'w', rx: -0.5, ry: 0, cursor: 'w-resize' },
];

interface TransformHandlesProps {
  spriteRef: React.RefObject<PIXI.Sprite>;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  id: string;
}

export function TransformHandles({
  spriteRef, x, y, width, height, rotation, id,
}: TransformHandlesProps) {
  const [isHeld, setIsHeld] = useState(false);
  const containerRef = useRef<PIXI.Container>(null);
  const dragState = useRef<{
    type: 'resize' | 'rotate';
    handle: string;
    startX: number;
    startY: number;
    startWidth?: number;
    startHeight?: number;
    startRotation: number;
  } | null>(null);

  const hw = width / 2;
  const hh = height / 2;

  const handlePointerUp = () => {
    setIsHeld(false);
    dragState.current = null;
  };

  const handleGlobalMove = (e: PIXI.FederatedPointerEvent) => {
    const state = dragState.current;
    const sprite = spriteRef.current;
    if (!isHeld || !state || !sprite) return;

    if (state.type === 'resize') {
      const dx = e.globalX - state.startX;
      const dy = e.globalY - state.startY;

      const affectsWidth = ['nw', 'ne', 'sw', 'se', 'e', 'w'].includes(state.handle);
      const affectsHeight = ['nw', 'ne', 'sw', 'se', 'n', 's'].includes(state.handle);
      const flipX = ['nw', 'sw', 'w'].includes(state.handle);
      const flipY = ['nw', 'ne', 'n'].includes(state.handle);

      if (affectsWidth) sprite.width = Math.max(20, state.startWidth! + (flipX ? -dx : dx));
      if (affectsHeight) sprite.height = Math.max(20, state.startHeight! + (flipY ? -dy : dy));
    }

    if (state.type === 'rotate') {
      const angle = Math.atan2(e.globalY - sprite.parent.y, e.globalX - sprite.parent.x);
      sprite.rotation = angle + Math.PI / 2;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.removeChildren();
    container.x = x;
    container.y = y;
    container.rotation = rotation;
    container.zIndex = 9999;

    // Border
    const border = new PIXI.Graphics();
    border.setStrokeStyle({ width: 1.5, color: BORDER_COLOR, alpha: 0.9 });
    border.rect(-hw, -hh, width, height);
    border.stroke();
    container.addChild(border);

    // Resize handles
    for (const handle of RESIZE_HANDLES) {
      const g = new PIXI.Graphics();
      g.setFillStyle({ color: HANDLE_COLOR });
      g.setStrokeStyle({ width: 1.5, color: BORDER_COLOR });
      g.rect(-HANDLE_SIZE / 2, -HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      g.fill();
      g.stroke();
      g.x = handle.rx * width;
      g.y = handle.ry * height;
      g.eventMode = 'static';
      g.cursor = handle.cursor;
      g.hitArea = new PIXI.Rectangle(-HANDLE_SIZE / 2, -HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);

      g.on('pointerdown', (e) => {
        e.stopPropagation();
        dragState.current = {
          type: 'resize',
          handle: handle.id,
          startX: e.globalX,
          startY: e.globalY,
          startWidth: spriteRef.current?.width ?? 0,
          startHeight: spriteRef.current?.height ?? 0,
          startRotation: spriteRef.current?.rotation ?? 0,
        };
        setIsHeld(true);
      });

      container.addChild(g);
    }

    // Rotate line
    const line = new PIXI.Graphics();
    line.setStrokeStyle({ width: 1, color: BORDER_COLOR, alpha: 0.7 });
    line.moveTo(0, -hh);
    line.lineTo(0, -hh - ROTATE_OFFSET);
    line.stroke();
    container.addChild(line);

    // Rotate handle
    const rotateG = new PIXI.Graphics();
    rotateG.setFillStyle({ color: ROTATE_COLOR });
    rotateG.circle(0, 0, HANDLE_SIZE / 2 + 2);
    rotateG.fill();
    rotateG.x = 0;
    rotateG.y = -hh - ROTATE_OFFSET;
    rotateG.eventMode = 'static';
    rotateG.cursor = 'grab';
    rotateG.hitArea = new PIXI.Circle(0, 0, HANDLE_SIZE / 2 + 2);

    rotateG.on('pointerdown', (e) => {
      e.stopPropagation();
      dragState.current = {
        type: 'rotate',
        handle: 'rotate',
        startX: e.globalX,
        startY: e.globalY,
        startRotation: spriteRef.current?.rotation ?? 0,
      };
      setIsHeld(true);
    });

    container.addChild(rotateG);

  }, [x, y, width, height, rotation, hw, hh, id]);

  return (
    <pixiContainer
      ref={containerRef}
      eventMode="static"
      onPointerUp={handlePointerUp}
      onPointerUpOutside={handlePointerUp}
      onGlobalMouseMove={handleGlobalMove}
    />
  );
}