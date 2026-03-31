import { Texture } from "pixi.js"

interface CachedTexture {
  texture: Texture
  width: number
  height: number
}

const textureCache: Record<string, CachedTexture> = {}

export function getTexture(src: string): Texture {
  if (!textureCache[src]) {
    const img = new Image()
    img.src = src
    const texture = Texture.from(img)
    
    textureCache[src] = {
      texture,
      width: img.width,
      height: img.height
    }
  }
  return textureCache[src].texture
}

export function getTextureDimensions(src: string): { width: number; height: number } {
  if (!textureCache[src]) {
    const img = new Image()
    img.src = src
    const texture = Texture.from(img)
    
    textureCache[src] = {
      texture,
      width: img.width,
      height: img.height
    }
  }
  
  return {
    width: textureCache[src].width,
    height: textureCache[src].height
  }
}

export function preloadTexture(src: string): Promise<{ texture: Texture; width: number; height: number }> {
  return new Promise((resolve) => {
    if (textureCache[src]) {
      resolve(textureCache[src])
    } else {
      const img = new Image()
      img.onload = () => {
        const texture = Texture.from(img)
        textureCache[src] = {
          texture,
          width: img.width,
          height: img.height
        }
        resolve(textureCache[src])
      }
      img.src = src
    }
  })
}