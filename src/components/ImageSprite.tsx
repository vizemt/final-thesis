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
    canvasX: number,
    canvasY: number,
    onSelect: (id: string, multi: boolean) => void
    onDelete: (id: string) => void
    onUpdate: (id: string, update: CanvasImage) => void
}

export function ImageSprite(props: ImageSpriteProps) {
    const containerRef = useRef<PIXI.Container>(null);
    const spriteRef = useRef<PIXI.Sprite>(null);

    const [texture] = useState(getTexture(props.image.texture))
    const [isHeld, setIsHeld] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // read image props on mount if image was changed before
    useEffect(() => {
        const sprite = spriteRef.current;
        if (!sprite) return;

        if (props.image.width) sprite.width = props.image.width;
        if (props.image.height) sprite.height = props.image.height;
        if (props.image.rotation) sprite.rotation = props.image.rotation;
        if (props.image.scale) {
            sprite.scale.x = props.image.scale.x;
            sprite.scale.y = props.image.scale.y;
        }
    }, []);

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

    const handleMouseUp = () => {
        setIsHeld(false);
        props.image.x = containerRef.current.x; // save new position
        props.image.y = containerRef.current.y;
        props.onUpdate(props.image.id, props.image);
    }

    const onTransform = () => {
        const sprite = spriteRef.current;
        if (!sprite) return;

        props.onUpdate(props.image.id, { // save new position
            ...props.image,
            width: sprite.width,
            height: sprite.height,
            rotation: sprite.rotation,
            scale: { x: sprite.scale.x, y: sprite.scale.y },
        });
    };

    return (
        <pixiContainer
            ref={containerRef}
            x={props.image.x ?? props.canvasX}
            y={props.image.y ?? props.canvasY}
            zIndex={props.zIndex}
        >
            <pixiSprite
                ref={spriteRef}
                anchor={0.5}
                eventMode="static"
                texture={texture}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
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
                    onUpdate={onTransform}
                />
            )}
        </pixiContainer>
    );
}