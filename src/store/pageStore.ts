import { create } from 'zustand'
import type { Page } from '../types/Page'
import type { CanvasImage } from '../types/CanvasImage'
import type { Layer } from '../types/Layer'
import type { GraphicsItem } from '../types/GraphicsItem'

const DEFAULT_PAGE_ID = 'page-1'

type PageStore = {
    pages: Page[]
    activePageId: string

    // getters
    getActivePage: () => Page | undefined
    getActivePageLayers: () => Layer[]
    getLayerById: (layerId: string) => Layer | undefined
    getLayerIndex: (layerId: string) => number

    // page actions
    setActivePageId: (id: string) => void
    addPage: (backgroundItem?: GraphicsItem, name?: string) => string
    duplicatePage: (pageId: string) => void
    deletePage: (pageId: string) => boolean
    renamePage: (pageId: string, newName: string) => void
    reorderPages: (dragIndex: number, hoverIndex: number) => void

    // image actions
    addImageToPage: (pageId: string, image: CanvasImage) => void
    removeImageFromPage: (pageId: string, imageId: string) => void
    updatePageImages: (pageId: string, images: CanvasImage[]) => void

    // layer actions
    updatePageLayers: (pageId: string, layers: Layer[]) => void
    updateImage: (pageId: string, imageId: string, updates: Partial<CanvasImage>) => void
    updateImageLayer: (pageId: string, imageId: string, layerId: string) => void
    addLayer: (layer: Omit<Layer, 'id'>) => Layer
    removeLayer: (layerId: string) => void
    duplicateLayer: (layerId: string) => void
    renameLayer: (layerId: string, newName: string) => void
    reorderLayers: (dragIndex: number, hoverIndex: number) => void
    toggleLayerVisibility: (layerId: string) => void
    updateLayerOpacity: (layerId: string, opacity: number) => void
    updateLayerZIndex: (layerId: string, zIndex: number) => void
    addItemToLayer: (layerId: string, item: GraphicsItem) => void
    removeItemFromLayer: (layerId: string, itemId: string) => void
    updateLayerItems: (layerId: string, items: GraphicsItem[]) => void
    setActiveLayerId: (layerId: string | null) => void

    // background
    setBackgroundItem: (backgroundItem?: GraphicsItem) => void

    // ui state
    activeLayerId: string | null
}

export const usePageStore = create<PageStore>((set, get) => ({
    pages: [
        {
            id: DEFAULT_PAGE_ID,
            name: 'Page 1',
            images: [],
            layers: [],
            order: 0
        }
    ],
    activePageId: DEFAULT_PAGE_ID,
    activeLayerId: null,

    getActivePage: () =>
        get().pages.find(p => p.id === get().activePageId),

    getActivePageLayers: () => {
        const activePage = get().getActivePage()
        return activePage?.layers || []
    },

    getLayerById: (layerId: string) => {
        const activePage = get().getActivePage()
        return activePage?.layers.find(l => l.id === layerId)
    },

    getLayerIndex: (layerId: string) => {
        const layers = get().getActivePageLayers()
        return layers.findIndex(l => l.id === layerId)
    },

    setActivePageId: (id) => set({
        activePageId: id,
        activeLayerId: null // Reset active layer when changing page
    }),
    
    addPage: (backgroundItem, name) => {
        const pages = get().pages

        const newPage: Page = {
            id: crypto.randomUUID(),
            name: name || `Page ${pages.length + 1}`,
            images: [],
            layers: [
                {
                    id: 'default',
                    name: 'Background',
                    visible: true,
                    opacity: 1,
                    zIndex: 0,
                    items: backgroundItem ? [backgroundItem] : []
                }
            ],
            order: pages.length
        }

        set({
            pages: [...pages, newPage],
            activePageId: newPage.id,
            activeLayerId: null
        })

        return newPage.id
    },

    duplicatePage: (pageId) => {
        const pages = get().pages
        const page = pages.find(p => p.id === pageId)
        if (!page) return

        const duplicated: Page = {
            ...page,
            id: crypto.randomUUID(),
            name: `${page.name} (Copy)`,
            images: page.images?.map(img => ({
                ...img,
                id: crypto.randomUUID(),
                layer: { ...img.layer, id: crypto.randomUUID() }
            })),
            layers: page.layers.map(layer => ({
                ...layer,
                id: crypto.randomUUID()
            })),
            order: pages.length
        }

        set({
            pages: [...pages, duplicated],
            activePageId: duplicated.id,
            activeLayerId: null
        })
    },

    deletePage: (pageId) => {
        const { pages, activePageId } = get()

        if (pages.length === 1) return false

        const filtered = pages.filter(p => p.id !== pageId)
            .map((p, i) => ({ ...p, order: i }))

        set({
            pages: filtered,
            activePageId:
                activePageId === pageId
                    ? filtered[0]?.id
                    : activePageId,
            activeLayerId: null
        })

        return true
    },

    renamePage: (pageId, newName) => {
        set({
            pages: get().pages.map(p =>
                p.id === pageId ? { ...p, name: newName } : p
            )
        })
    },

    reorderPages: (dragIndex, hoverIndex) => {
        const pages = [...get().pages]
        const dragged = pages[dragIndex]

        pages.splice(dragIndex, 1)
        pages.splice(hoverIndex, 0, dragged)

        set({
            pages: pages.map((p, i) => ({ ...p, order: i }))
        })
    },

    addImageToPage: (pageId, image) => {
        set({
            pages: get().pages.map(p =>
                p.id === pageId
                    ? { ...p, images: [...(p.images || []), image] }
                    : p
            )
        })
    },

    removeImageFromPage: (pageId, imageId) => {
        set({
            pages: get().pages.map(p =>
                p.id === pageId
                    ? {
                        ...p,
                        images: (p.images || []).filter(img => img.id !== imageId)
                    }
                    : p
            )
        })
    },

    updateImage: (pageId: string, imageId: string, updates: Partial<CanvasImage>) => {
        set({
            pages: get().pages.map(page =>
                page.id === pageId
                    ? {
                        ...page,
                        images: (page.images || []).map(img =>
                            img.id === imageId ? { ...img, ...updates } : img
                        )
                    }
                    : page
            )
        })
    },

    updateImageLayer: (pageId: string, imageId: string, layerId: string) => {
        const page = get().pages.find(p => p.id === pageId)
        const layer = page?.layers.find(l => l.id === layerId)

        if (!layer) return

        set({
            pages: get().pages.map(page =>
                page.id === pageId
                    ? {
                        ...page,
                        images: (page.images || []).map(img =>
                            img.id === imageId
                                ? { ...img, layer: { ...layer, id: layerId } }
                                : img
                        )
                    }
                    : page
            )
        })
    },

    updatePageImages: (pageId, images) => {
        set({
            pages: get().pages.map(p =>
                p.id === pageId ? { ...p, images } : p
            )
        })
    },

    updatePageLayers: (pageId, layers) => {
        set({
            pages: get().pages.map(p =>
                p.id === pageId ? { ...p, layers } : p
            )
        })
    },

    // Layer actions
    addLayer: (layer) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        const newLayer: Layer = {
            ...layer,
            id: crypto.randomUUID(),
            visible: layer.visible ?? true,
            opacity: layer.opacity ?? 1,
            zIndex: activePage.layers.length,
            items: layer.items || []
        }

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? { ...page, layers: [...page.layers, newLayer] }
                    : page
            ),
            activeLayerId: newLayer.id
        })

        return newLayer
    },

    removeLayer: (layerId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        // Don't allow removing the last layer
        if (activePage.layers.length === 1) {
            console.warn('Cannot remove the last layer')
            return
        }

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? { ...page, layers: page.layers.filter(l => l.id !== layerId) }
                    : page
            ),
            activeLayerId: get().activeLayerId === layerId ? null : get().activeLayerId
        })
    },

    duplicateLayer: (layerId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        const layerToDuplicate = activePage.layers.find(l => l.id === layerId)
        if (!layerToDuplicate) return

        const duplicatedLayer: Layer = {
            ...layerToDuplicate,
            id: crypto.randomUUID(),
            name: `${layerToDuplicate.name} (Copy)`,
            items: layerToDuplicate.items.map(item => ({
                ...item,
                id: crypto.randomUUID()
            }))
        }

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? { ...page, layers: [...page.layers, duplicatedLayer] }
                    : page
            )
        })
    },

    renameLayer: (layerId, newName) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId ? { ...layer, name: newName } : layer
                        )
                    }
                    : page
            )
        })
    },

    reorderLayers: (dragIndex, hoverIndex) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        const layers = [...activePage.layers]
        const dragged = layers[dragIndex]
        layers.splice(dragIndex, 1)
        layers.splice(hoverIndex, 0, dragged)

        // Update zIndex based on new order
        const reorderedLayers = layers.map((layer, index) => ({
            ...layer,
            zIndex: index
        }))

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? { ...page, layers: reorderedLayers }
                    : page
            )
        })
    },

    toggleLayerVisibility: (layerId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId
                                ? { ...layer, visible: !layer.visible }
                                : layer
                        )
                    }
                    : page
            )
        })
    },

    updateLayerOpacity: (layerId, opacity) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId
                                ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) }
                                : layer
                        )
                    }
                    : page
            )
        })
    },

    updateLayerZIndex: (layerId, zIndex) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId ? { ...layer, zIndex } : layer
                        )
                    }
                    : page
            )
        })
    },

    addItemToLayer: (layerId, item) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId
                                ? { ...layer, items: [...(layer.items || []), item] }
                                : layer
                        )
                    }
                    : page
            )
        })
    },

    removeItemFromLayer: (layerId, itemId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId
                                ? {
                                    ...layer,
                                    items: (layer.items || []).filter(item => item.id !== itemId)
                                }
                                : layer
                        )
                    }
                    : page
            )
        })
    },

    updateLayerItems: (layerId, items) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        set({
            pages: get().pages.map(page =>
                page.id === activePage.id
                    ? {
                        ...page,
                        layers: page.layers.map(layer =>
                            layer.id === layerId ? { ...layer, items } : layer
                        )
                    }
                    : page
            )
        })
    },

    setActiveLayerId: (layerId) => {
        set({ activeLayerId: layerId })
    },
    setBackgroundItem: (backgroundItem) => {
        if (!backgroundItem) return

        set({
            pages: get().pages.map(page => ({
                ...page,
                layers: page.layers.map(layer =>
                    layer.id === 'default'
                        ? { ...layer, items: [backgroundItem] }
                        : layer
                )
            }))
        })
    }
}))