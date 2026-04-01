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
    onDelete: (id: string) => void
}

export function ImageSprite(props: ImageSpriteProps) {
    const containerRef = useRef<PIXI.Container>(null);
    const spriteRef = useRef<PIXI.Sprite>(null);

    const [texture] = useState(getTexture(props.image.texture))
    const [isHeld, setIsHeld] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete') && props.isSelected) {
                props.onDelete(props.image.id);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [props.isSelected, props.image.id, props.onDelete]);

    // Global mouse up handler to release drag anywhere
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isHeld) {
                setIsHeld(false);
            }
        };
        
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isHeld]);

    const handleMouseDown = (e: any) => {
        //console.log(`z: ${props.image.layer?.zIndex}`);
        if (!props.isSelected) {
            props.onSelect(props.image.id, false)
        }
        setOffset({
            x: e.currentTarget.parent.x - e.globalX,
            y: e.currentTarget.parent.y - e.globalY,
        });
        setIsHeld(true);
    }

    const handleMouseMove = (e: any) => {
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

            {props.isSelected && spriteRef.current && (
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