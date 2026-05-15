import type { Page } from '../types/Page'

interface PlayerControlsProps {
    activePage: Page
    onNavigate: (pageId: string) => void //TODO number of pages
    onExit: () => void
}

export function PlayerControls({ activePage, onNavigate, onExit }: PlayerControlsProps) {
    
    return (
        <div style={{
            position: 'absolute',
            bottom: 24,
            left: 0, right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            pointerEvents: 'none',  // let clicks through except on buttons
        }}>
            <button
                style={{ pointerEvents: 'all' }}
                disabled={!activePage.parentPageId}
                onClick={() => onNavigate(activePage.parentPageId)}
            >← Prev</button>

            <span>{activePage.order} / N</span>

            <button
                style={{ pointerEvents: 'all' }}
                disabled={!activePage.childrenPages || activePage.childrenPages.length === 0}
                onClick={() => onNavigate(activePage.childrenPages.at(0).id)}
            >Next →</button>

            <button
                style={{ pointerEvents: 'all', marginLeft: 32 }}
                onClick={onExit}
            >✕ Exit</button>
        </div>
    )
}