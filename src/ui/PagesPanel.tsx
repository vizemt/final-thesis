import { Copy, Trash2, Edit2, GitBranch, Plus, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Page } from '../types/Page'
import { PageCell } from './components/PageCell'

type PagesPanelProps = {
  rootPage: Page
  activePageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => void
  onAddBranch: () => void
  onDuplicatePage: () => void
  onDeletePage: () => void
  onRenamePage: (pageId: string, newName: string) => void
}

function findPage(root: Page, id: string): Page | undefined {
  if (root.id === id) return root;
  for (const child of root.childrenPages) {
    const found = findPage(child, id);
    if (found) return found;
  }
  return undefined;
}

interface GridCell {
  row: number; // 1-based depth
  col: number; // 0-based branch index (0 = col A)
  page: Page;
}
 
function buildGrid(root: Page): GridCell[] {
  const result: GridCell[] = [];
  let nextCol = 1;
 
  function dfs(node: Page, depth: number, col: number) {
    result.push({ row: depth, col, page: node });
    if (node.childrenPages.length === 0) return;
    // First child continues same column (main branch)
    dfs(node.childrenPages[0], depth + 1, col);
    // Additional children get new branch columns
    for (let i = 1; i < node.childrenPages.length; i++) {
      dfs(node.childrenPages[i], depth + 1, nextCol++);
    }
  }
 
  dfs(root, 1, 0);
  return result;
}

function countPages(page: Page): number {
  return 1 + page.childrenPages.reduce((n, c) => n + countPages(c), 0)
}

export default function PagesPanel({
  rootPage,
  activePageId,
  onSelectPage,
  onAddPage,
  onAddBranch,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
}: PagesPanelProps) {

    const cells = buildGrid(rootPage);

    const maxRow = cells.reduce((m, c) => Math.max(m, c.row), 1);
    const maxCol = cells.reduce((m, c) => Math.max(m, c.col), 0);

    const cellMap: Record<string, Page> = {};
    cells.forEach((c) => { cellMap[`${c.row},${c.col}`] = c.page; });

    const colLabels = Array.from({ length: maxCol + 1 }, (_, i) =>
        String.fromCharCode(65 + i)
    );
    const rowLabels = Array.from({ length: maxRow }, (_, i) => i + 1);

    // const handleAddPage = (pageId: string) => {
    //     const deepest = (node: Page): Page =>
    //         node.childrenPages.length === 0 ? node : deepest(node.childrenPages[0]);
    //     const target = findPage(rootPage, pageId);
    //     if (!target) return;
    //     onAddPage(pageId);
    // };

    useEffect(() => {
      console.log(rootPage);
    }, [rootPage]);
    
    return (
        <div className="panel">
            <div className="panel-header">
                <h3>Pages</h3>
                <button onClick={onAddPage} title="Add page">+Page</button>
                <button onClick={onAddBranch} title="Add branch">+Branch</button>
                <button onClick={onDeletePage} title="Duplicate">Delete</button>
            </div>
            <div className="plotgrid-wrap">
                <table className="plotgrid-table">
                    <thead>
                        <tr>
                            <th className="plotgrid-corner" />
                            {colLabels.map((label) => (
                                <th key={label} className="plotgrid-col-header">{label}</th> // here
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowLabels.map((row) => (
                            <tr key={row}>
                                <td className="plotgrid-row-label">{row}</td>
                                {colLabels.map((_, colIdx) => {
                                    const page = cellMap[`${row},${colIdx}`];
                                    if (!page) return <td key={`empty-${row}-${colIdx}`} className="plotgrid-empty" />;
                                    return (
                                        <PageCell
                                            key={page.id}
                                            page={page}
                                            isRoot={page.id === rootPage.id}
                                            isActive={page.id === activePageId}
                                            onSelect={() => onSelectPage(page.id)}
                                            onRename={(name) => onRenamePage(page.id, name)}
                                        />
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>);
}