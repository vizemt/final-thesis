import { Texture } from "pixi.js"

const textureCache: Record<string, Texture> = {}

export function getTexture(src: string): Texture {
  if (!textureCache[src]) {
    const img = new Image()
    img.src = src
    textureCache[src] = Texture.from(img)
  }
  return textureCache[src]
}

export function preloadTexture(src: string): Promise<Texture> {
  return new Promise((resolve) => {
    if (textureCache[src]) {
      resolve(textureCache[src])
    } else {
      const img = new Image()
      img.onload = () => {
        textureCache[src] = Texture.from(img)
        resolve(textureCache[src])
      }
      img.src = src
    }
  })
}