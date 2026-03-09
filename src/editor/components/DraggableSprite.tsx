import { useState } from "react"
import { Texture } from "pixi.js"

type Props = {
  texture: Texture
  x: number
  y: number
}

export default function DraggableSprite({ texture, x, y }: Props) {
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x, y })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const onPointerDown = (e: any) => {
    const pos = e.data.getLocalPosition(e.currentTarget)

    setOffset({
      x: pos.x,
      y: pos.y,
    })

    setDragging(true)
  }

  const onPointerUp = () => {
    setDragging(false)
  }

const onPointerMove = (e: any) => {
  if (!dragging) return

  const pos = e.data.getLocalPosition(e.currentTarget.parent)

  e.currentTarget.x = pos.x - offset.x
  e.currentTarget.y = pos.y - offset.y
}

  return (
    <pixiSprite
      texture={texture}
      x={position.x}
      y={position.y}
      eventMode="static"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerUpOutside={onPointerUp}
      onPointerMove={onPointerMove}
    />
  )
}