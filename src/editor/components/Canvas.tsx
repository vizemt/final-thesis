import { Application, extend, useTick } from "@pixi/react"
import { Assets, Texture, Container as PixiContainer, Container, Sprite } from "pixi.js"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container,
  Sprite,
})

type Props = {
  images: CanvasImage[]
}

const textureCache: Record<string, Texture> = {}

function getTexture(src: string) {
  if (!textureCache[src]) {
    const img = new Image()
    img.src = src
    textureCache[src] = Texture.from(img)
  }
  return textureCache[src]
}

function Scene({ images }: Props) {
  return (
    <pixiContainer>
      {images.map(img => (
        <pixiSprite
          key={img.id}
          texture={getTexture(img.texture)}
          x={img.x}
          y={img.y}
        />
      ))}
    </pixiContainer>
  )
}

// function BunnyGrid() {
//   const containerRef = useRef<PixiContainer>(null)
//   const [texture, setTexture] = useState<Texture | null>(null)

//   useEffect(() => {
//     Assets.load("https://pixijs.com/assets/bunny.png").then(setTexture)
//   }, [])

//   useTick((delta) => {
//     if (containerRef.current) {
//       //containerRef.current.position.y -= 10 * delta.deltaTime
//       containerRef.current.rotation -= 0.02 * delta.deltaTime;
//     }
//   })

//   if (!texture) return null

//   const bunnies = []

//   for (let i = 0; i < 50; i++) {
//     const x = (i % 5) * 30
//     const y = Math.floor(i / 5) * 40

//     bunnies.push(
//       <pixiSprite
//         key={i}
//         texture={texture}
//         x={x}
//         y={y}
//       />
//     )
//   }

//   return (
//     <pixiContainer
//       ref={containerRef}
//       x={600}
//       y={300}
//       pivot={{ x: 100, y: 100 }}
//     >
//       {bunnies}
//     </pixiContainer>
//   )
// }

export default function Canvas({ images }: Props) {
  return (
    <Application width={1600} height={600} background={0x1000ff}>
      <Scene images={images} />
    </Application>
  )
}

// export default function Canvas() {
//   return (
//     <Application
//       width={1600}
//       height={600}
//       background={0x1000FF}
//     >
//       <BunnyGrid />
//     </Application>
//   )
// }


// Upload Image
//      ↓
// Library Preview
//      ↓
// Click Thumbnail
//      ↓
// addImageToCanvas()
//      ↓
// App updates canvasImages
//      ↓
// Canvas receives new props
//      ↓
// Pixi renders new Sprite