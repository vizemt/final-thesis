import { useState, useCallback, useEffect } from 'react'
import type { Page } from '../types/Page'
import type { CanvasImage } from '../types/CanvasImage'
import type { Layer } from '../types/Layer'
import type { GraphicsItem } from '../types/GraphicsItem'

const DEFAULT_PAGE_ID = 'page-1'

export function usePages(
    initialImages: CanvasImage[] = [],
    initialLayers: Layer[] = [],
    backgroundItem?: GraphicsItem
) {
    const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([])
    const [activePageId, setActivePageId] = useState<string>(DEFAULT_PAGE_ID)
    const [pages, setPages] = useState<Page[]>([
        {
            id: DEFAULT_PAGE_ID,
            name: 'Page 1',
            images: initialImages,
            layers: initialLayers,
            order: 0
        }
    ])

    // Get current page
    const activePage = pages.find(p => p.id === activePageId)

    // Sync backgroundItem into page-1's default layer
    useEffect(() => {
        if (!backgroundItem) return
        setPages(prev => prev.map(page => ({
            ...page,
            layers: page.layers.map(layer =>
                layer.id === 'default'
                    ? { ...layer, items: [backgroundItem] }
                    : layer
            )
        })))
    }, [backgroundItem])

    const addImageToPage = useCallback((pageId: string, image: CanvasImage) => {
        setPages(prev => prev.map(page =>
            page.id === pageId
                ? { ...page, images: [...page.images as CanvasImage[], image] }
                : page
        ))
    }, [])

    const removeImageFromPage = useCallback((pageId: string, imageId: string) => {
        setPages(prev => prev.map(page =>
            page.id === pageId
                ? { ...page, images: (page.images as CanvasImage[]).filter(img => img.id !== imageId) }
                : page
        ))
    }, [])

    // Add new page
    const addPage = useCallback((name?: string) => {
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

        setPages(prev => [...prev, newPage])
        setActivePageId(newPage.id)

        return newPage.id
    }, [pages.length, backgroundItem])

    // Duplicate page
    const duplicatePage = useCallback((pageId: string) => {
        const pageToDuplicate = pages.find(p => p.id === pageId)
        if (!pageToDuplicate) return

        const duplicatedPage: Page = {
            ...pageToDuplicate,
            id: crypto.randomUUID(),
            name: `${pageToDuplicate.name} (Copy)`,
            images: pageToDuplicate.images.map(img => ({
                ...img,
                id: crypto.randomUUID(),
                layer: { ...img.layer, id: crypto.randomUUID() } // Create new layer IDs
            })),
            layers: pageToDuplicate.layers.map(layer => ({
                ...layer,
                id: crypto.randomUUID()
            })),
            order: pages.length
        }

        setPages(prev => [...prev, duplicatedPage])
        setActivePageId(duplicatedPage.id)
    }, [pages])

    // Delete page
    const deletePage = useCallback((pageId: string) => {
        if (pages.length === 1) {
            console.warn('Cannot delete the last page')
            return false
        }

        setPages(prev => {
            const filtered = prev.filter(p => p.id !== pageId)
            // Reorder remaining pages
            return filtered.map((page, index) => ({
                ...page,
                order: index
            }))
        })

        // If we're deleting the active page, switch to another page
        if (activePageId === pageId) {
            const remainingPages = pages.filter(p => p.id !== pageId)
            if (remainingPages.length > 0) {
                setActivePageId(remainingPages[0].id)
            }
        }

        return true
    }, [pages, activePageId])

    // Rename page
    const renamePage = useCallback((pageId: string, newName: string) => {
        setPages(prev => prev.map(page =>
            page.id === pageId
                ? { ...page, name: newName }
                : page
        ))
    }, [])

    // Reorder pages
    const reorderPages = useCallback((dragIndex: number, hoverIndex: number) => {
        setPages(prev => {
            const newPages = [...prev]
            const draggedPage = newPages[dragIndex]
            newPages.splice(dragIndex, 1)
            newPages.splice(hoverIndex, 0, draggedPage)

            // Update order property
            return newPages.map((page, index) => ({
                ...page,
                order: index
            }))
        })
    }, [])

    // Update images for current page
    const updatePageImages = useCallback((newImages: CanvasImage[]) => {
        if (!activePage) return

        setPages(prev => prev.map(page =>
            page.id === activePageId
                ? { ...page, images: newImages }
                : page
        ))
    }, [activePage, activePageId])

    // Update layers for current page
    const updatePageLayers = useCallback((newLayers: Layer[]) => {
        if (!activePage) return

        setPages(prev => prev.map(page =>
            page.id === activePageId
                ? { ...page, layers: newLayers }
                : page
        ))
    }, [activePage, activePageId])

    return {
        pages,
        activePageId,
        activePage,
        setCanvasImages,
        addPage,
        duplicatePage,
        deletePage,
        renamePage,
        reorderPages,
        setActivePageId,
        updatePageImages,
        updatePageLayers,
        addImageToPage,
        removeImageFromPage
    }
}