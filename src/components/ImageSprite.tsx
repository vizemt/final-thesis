import * as PIXI from 'pixi.js'
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasImage } from '../types/CanvasImage';
import { extend } from '@pixi/react';
import { getTexture } from '../utils/textureCache';
import { TransformHandles } from './TransformHandles';

extend({
    Sprite: PIXI.Sprite,
    Graphics: PIXI.Graphics,
    Container: PIXI.Container,
})

interface ImageSpriteProps {
    image: CanvasImage,
    isSelected: boolean,
    zIndex: number,
    onSelect: (id: string, multi: boolean) => void
}

export function ImageSprite(props: ImageSpriteProps) {
    const containerRef = useRef<PIXI.Container>(null);
    const spriteRef = useRef<PIXI.Sprite>(null);

    const [texture] = useState(getTexture(props.image.texture))
    const [isHeld, setIsHeld] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (props.isSelected) {
            setOffset({
                x: e.currentTarget.parent.x - e.globalX,
                y: e.currentTarget.parent.y - e.globalY,
            });
            setIsHeld(true);
        }
    }

    const handleMouseMove = (e) => {
        if (isHeld && containerRef.current) {
            containerRef.current.x = e.globalX + offset.x;
            containerRef.current.y = e.globalY + offset.y;
        }
    }

    return (
        <pixiContainer
            ref={containerRef}
            x={props.image.x ?? 100}
            y={props.image.y ?? 100}
            zIndex={props.zIndex}
        >
            <pixiSprite
                ref={spriteRef}
                anchor={0.5}
                eventMode="static"
                texture={texture}
                onMouseDown={handleMouseDown}
                onMouseUp={() => setIsHeld(false)}
                onGlobalMouseMove={handleMouseMove}
                onClick={() => props.onSelect(props.image.id, false)}
            />

            {props.isSelected && spriteRef.current && ( // TODO multi-selection... maybe
                <TransformHandles
                    id={props.image.id}
                    x={0}
                    y={0}
                    width={spriteRef.current.width}
                    height={spriteRef.current.height}
                    rotation={spriteRef.current.rotation ?? 0}
                    spriteRef={spriteRef}
                />
            )}
        </pixiContainer>
    );
}