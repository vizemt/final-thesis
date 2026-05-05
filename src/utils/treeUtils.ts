import type { Page } from "../types/Page"

export function findPage(root: Page, id: string): Page | undefined {
    if (root.id === id) return root
    for (const child of root.childrenPages) {
        const found = findPage(child, id)
        if (found) return found
    }
    return undefined
}

// Returns a new tree with the matching node replaced by fn(node)
export function updatePage(root: Page, id: string, fn: (p: Page) => Page): Page {
    if (root.id === id) return fn(root)
    return {
        ...root,
        childrenPages: root.childrenPages.map(child => updatePage(child, id, fn)),
    }
}

// Returns a new tree with the target page removed
export function deletePage(root: Page, id: string): Page {
    return {
        ...root,
        childrenPages: root.childrenPages
            .filter(child => child.id !== id)
            .map(child => deletePage(child, id)),
    }
}

// Flattens the tree into a list (DFS)
export function flattenPages(root: Page): Page[] {
    return [root, ...root.childrenPages.flatMap(flattenPages)]
}

export function countPages(root: Page): number {
    return 1 + root.childrenPages.reduce((n, c) => n + countPages(c), 0)
}
