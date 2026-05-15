import { create } from 'zustand'
import type { Page } from '../types/Page'
import type { CanvasImage } from '../types/CanvasImage'
import type { Layer } from '../types/Layer'
import type { GraphicsItem } from '../types/GraphicsItem'
import { deletePage, findPage, updatePage, flattenPages, countPages } from '../utils/treeUtils'

const DEFAULT_PAGE_ID = 'page-1'

type PageStore = {
    rootPage: Page
    activePageId: string
    activeLayerId: string | null

    // getters
    getActivePage: () => Page | undefined
    getActivePageLayers: () => Layer[]
    getLayerById: (layerId: string) => Layer | undefined
    getLayerIndex: (layerId: string) => number
    getAllPages: () => Page[]

    // page actions
    setActivePageId: (id: string) => void
    addPage: (backgroundItem?: GraphicsItem, parentId?: string) => string
    addBranch: (backgroundItem?: GraphicsItem, parentId?: string) => string
    duplicatePage: (pageId: string) => void
    deletePage: (pageId: string) => boolean
    renamePage: (pageId: string, newName: string) => void

    // image actions
    addImageToPage: (pageId: string, image: CanvasImage) => void
    removeImageFromPage: (pageId: string, imageId: string) => void
    updatePageImages: (pageId: string, images: CanvasImage[]) => void
    setBackgroundItem: (backgroundItem?: GraphicsItem) => void

    // layer actions
    updatePageLayers: (pageId: string, layers: Layer[]) => void
    updateImage: (pageId: string, imageId: string, updates: Partial<CanvasImage>) => void
    updateImageLayer: (pageId: string, imageId: string, layerId: string) => void
    addLayer: (layer: Omit<Layer, 'id'>) => Layer | undefined
    removeLayer: (layerId: string) => void
    duplicateLayer: (layerId: string) => void
    renameLayer: (layerId: string, newName: string) => void
    reorderLayers: (dragLayerId: string, hoverLayerId: string) => void
    toggleLayerVisibility: (layerId: string) => void
    updateLayerOpacity: (layerId: string, opacity: number) => void
    updateLayerZIndex: (layerId: string, zIndex: number) => void
    addItemToLayer: (layerId: string, item: GraphicsItem) => void
    removeItemFromLayer: (layerId: string, itemId: string) => void
    updateLayerItems: (layerId: string, items: GraphicsItem[]) => void
    setActiveLayerId: (layerId: string | null) => void

}

function makeDefaultLayer(backgroundItem?: GraphicsItem): Layer {
    return {
        id: 'default',
        name: 'Background',
        visible: true,
        opacity: 1,
        zIndex: 0,
        items: backgroundItem ? [backgroundItem] : [],
    }
}

export const usePageStore = create<PageStore>((set, get) => ({
    rootPage: {
        id: DEFAULT_PAGE_ID,
        name: 'Page 1',
        images: [],
        layers: [makeDefaultLayer()],
        order: 0,
        parentPageId: null,
        childrenPages: [],
        hotspots: []
    },
    activePageId: DEFAULT_PAGE_ID,
    activeLayerId: null,

    // Getters _____________________________________________

    getAllPages: () => flattenPages(get().rootPage),

    getActivePage: () => findPage(get().rootPage, get().activePageId),

    getActivePageLayers: () => get().getActivePage()?.layers ?? [],

    getLayerById: (layerId) =>
        get().getActivePage()?.layers.find(l => l.id === layerId),

    getLayerIndex: (layerId) =>
        get().getActivePageLayers().findIndex(l => l.id === layerId),

    // Page actions _____________________________________________

    setActivePageId: (id) => set({ activePageId: id, activeLayerId: null }),

    // Adds a top-level child page to the root.
    // Returns the new page's id.
    addPage: (backgroundItem) => {
        const activePage = findPage(get().rootPage, get().activePageId)
        const total = countPages(get().rootPage) // TODO fix order
        const newPage: Page = {
            id: crypto.randomUUID(),
            name: `Page ${total + 1}`,
            images: [],
            layers: [makeDefaultLayer(backgroundItem)],
            order: total,
            parentPageId: activePage.id,
            childrenPages: [],
            hotspots: []
        }

        set(s => ({
            rootPage: updatePage(s.rootPage, activePage.id, p => ({
                ...p,
                childrenPages: [...p.childrenPages, newPage],
            })),
            activePageId: newPage.id,
            activeLayerId: null,
        }))
        return newPage.id
    },

    // Adds a branch (child page) under the given parent
    // Returns the new page's id.
    addBranch: (backgroundItem, parentId) => {
        const resolvedParentId = parentId ?? get().activePageId
        const parent = findPage(get().rootPage, resolvedParentId)
        if (!parent) return ''

        const newPage: Page = {
            id: crypto.randomUUID(),
            name: `${parent.name} – Branch ${parent.childrenPages.length + 1}`,
            images: [],
            layers: [makeDefaultLayer(backgroundItem)],
            order: parent.childrenPages.length,
            parentPageId: resolvedParentId,
            childrenPages: [],
            hotspots: []
        }

        set(s => ({
            rootPage: updatePage(s.rootPage, resolvedParentId, p => ({
                ...p,
                childrenPages: [...p.childrenPages, newPage],
            })),
            activePageId: newPage.id,
            activeLayerId: null,
        }))

        return newPage.id
    },

    duplicatePage: (pageId) => {
        const page = findPage(get().rootPage, pageId)
        if (!page) return

        const parentId = page.parentPageId ?? get().rootPage.id

        const duplicated: Page = {
            ...page,
            id: crypto.randomUUID(),
            name: `${page.name} (Copy)`,
            images: page.images?.map(img => ({ ...img, id: crypto.randomUUID() })),
            layers: page.layers.map(layer => ({ ...layer, id: crypto.randomUUID() })),
            // Duplicate keeps same parent but starts with no children of its own
            childrenPages: [],
            parentPageId: parentId,
            order: countPages(get().rootPage),
        }

        set(s => ({
            rootPage: updatePage(s.rootPage, parentId, p => ({
                ...p,
                childrenPages: [...p.childrenPages, duplicated],
            })),
            activePageId: duplicated.id,
            activeLayerId: null,
        }))
    },

    deletePage: (pageId) => {
        if (pageId === get().rootPage.id) return false // never delete root

        const all = flattenPages(get().rootPage)
        if (all.length === 1) return false

        const newRoot = deletePage(get().rootPage, pageId)

        // If the active page is deleted, fall back to root
        const nextActiveId =
            get().activePageId === pageId
                ? newRoot.id
                : get().activePageId

        set({ rootPage: newRoot, activePageId: nextActiveId, activeLayerId: null })
        return true
    },

    renamePage: (pageId, newName) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({ ...p, name: newName })),
        })),

    // Image actions ____________________________________________
    addImageToPage: (pageId, image) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({
                ...p,
                images: [...(p.images ?? []), image],
            })),
        })),

    removeImageFromPage: (pageId, imageId) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({
                ...p,
                images: (p.images ?? []).filter(img => img.id !== imageId),
            })),
        })),

    updatePageImages: (pageId, images) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({ ...p, images })),
        })),

    updateImage: (pageId, imageId, updates) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({
                ...p,
                images: (p.images ?? []).map(img =>
                    img.id === imageId ? { ...img, ...updates } : img
                ),
            })),
        })),

    updateImageLayer: (pageId, imageId, layerId) => {
        const page = findPage(get().rootPage, pageId)
        const layer = page?.layers.find(l => l.id === layerId)
        if (!layer) return

        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({
                ...p,
                images: (p.images ?? []).map(img =>
                    img.id === imageId
                        ? { ...img, layer: { ...layer, id: layerId } }
                        : img
                ),
            })),
        }))
    },

    // Layer actions ____________________________________________

    updatePageLayers: (pageId, layers) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, pageId, p => ({ ...p, layers })),
        })),

    addLayer: (layer) => {
        const activePage = get().getActivePage()
        if (!activePage) return undefined

        const newLayer: Layer = {
            ...layer,
            id: crypto.randomUUID(),
            visible: layer.visible ?? true,
            opacity: layer.opacity ?? 1,
            zIndex: activePage.layers.length,
            items: layer.items ?? [],
        }

        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: [...p.layers, newLayer],
            })),
            activeLayerId: newLayer.id,
        }))

        return newLayer
    },

    removeLayer: (layerId) => {
        const activePage = get().getActivePage()
        if (!activePage || activePage.layers.length === 1) return

        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.filter(l => l.id !== layerId),
            })),
            activeLayerId:
                get().activeLayerId === layerId ? null : get().activeLayerId,
        }))
    },

    duplicateLayer: (layerId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        const src = activePage.layers.find(l => l.id === layerId)
        if (!src) return

        const duplicated: Layer = {
            ...src,
            id: crypto.randomUUID(),
            name: `${src.name} (Copy)`,
            items: src.items.map(item => ({ ...item, id: crypto.randomUUID() })),
        }

        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: [...p.layers, duplicated],
            })),
        }))
    },

    renameLayer: (layerId, newName) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId ? { ...l, name: newName } : l
                ),
            })),
        })),

    reorderLayers: (dragLayerId, hoverLayerId) => {
        const activePage = get().getActivePage()
        if (!activePage) return

        const layers = [...activePage.layers]
        const dragLayer = activePage.layers.find(l => l.id === dragLayerId)
        const hoverLayer = activePage.layers.find(l => l.id === hoverLayerId)
        const [dragged] = layers.splice(dragLayer.zIndex, 1)
        layers.splice(hoverLayer.zIndex, 0, dragged)
        const reordered = layers.map((l, i) => ({ ...l, zIndex: i }))

        // Build a quick lookup map of updated layers
        const layerMap = Object.fromEntries(reordered.map(l => [l.id, l]))

        // Sync updated layer (with new zIndex) back onto each image
        const updatedImages = (activePage.images ?? []).map(img =>
            img.layer && layerMap[img.layer.id]
                ? { ...img, layer: layerMap[img.layer.id] }
                : img
        )

        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: reordered,
                images: updatedImages,
            })),
        }))
    },

    toggleLayerVisibility: (layerId) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId ? { ...l, visible: !l.visible } : l
                ),
            })),
        })),

    updateLayerOpacity: (layerId, opacity) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId
                        ? { ...l, opacity: Math.max(0, Math.min(1, opacity)) }
                        : l
                ),
            })),
        })),

    updateLayerZIndex: (layerId, zIndex) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId ? { ...l, zIndex } : l
                ),
            })),
        })),

    addItemToLayer: (layerId, item) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId
                        ? { ...l, items: [...(l.items ?? []), item] }
                        : l
                ),
            })),
        })),

    removeItemFromLayer: (layerId, itemId) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId
                        ? { ...l, items: (l.items ?? []).filter(i => i.id !== itemId) }
                        : l
                ),
            })),
        })),

    updateLayerItems: (layerId, items) =>
        set(s => ({
            rootPage: updatePage(s.rootPage, s.activePageId, p => ({
                ...p,
                layers: p.layers.map(l =>
                    l.id === layerId ? { ...l, items } : l
                ),
            })),
        })),

    setActiveLayerId: (layerId) => set({ activeLayerId: layerId }),

    setBackgroundItem: (backgroundItem) => {
        if (!backgroundItem) return
        // Applies to ALL pages in the tree
        const applyToAll = (page: Page): Page => ({
            ...page,
            layers: page.layers.map(l =>
                l.id === 'default' ? { ...l, items: [backgroundItem] } : l
            ),
            childrenPages: page.childrenPages.map(applyToAll),
        })
        set(s => ({ rootPage: applyToAll(s.rootPage) }))
    },
}))