// Utility functions for building file trees from API data

export interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size?: number
  modified?: Date
  children?: FileSystemItem[]
}

export interface ApiFileInfo {
  file_name: string
  file_size: number
  file_type: string
  file_path: string
  date_uploaded: string
  date_modified: string
  date_accessed: string
  kind: string
  device_name: string
  file_id?: string
}

/**
 * Converts flat file list from API into hierarchical tree structure
 */
export function buildFileTree(files: ApiFileInfo[]): FileSystemItem[] {
  const tree: Map<string, FileSystemItem> = new Map()
  const rootItems: FileSystemItem[] = []

  // First pass: create all items
  files.forEach((file) => {
    const pathParts = file.file_path.split('/').filter(part => part.length > 0)
    let currentPath = ''

    pathParts.forEach((part, index) => {
      const isFile = index === pathParts.length - 1 && file.file_name === part
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      if (!tree.has(currentPath)) {
        const item: FileSystemItem = {
          id: currentPath,
          name: part,
          type: isFile ? 'file' : 'folder',
          path: currentPath,
          children: isFile ? undefined : []
        }

        if (isFile) {
          item.size = file.file_size
          item.modified = new Date(file.date_modified)
        }

        tree.set(currentPath, item)
      }
    })
  })

  // Second pass: build parent-child relationships
  tree.forEach((item) => {
    const pathParts = item.path.split('/')
    if (pathParts.length === 1) {
      // Root level item
      rootItems.push(item)
    } else {
      // Find parent
      const parentPath = pathParts.slice(0, -1).join('/')
      const parent = tree.get(parentPath)
      if (parent && parent.children) {
        parent.children.push(item)
      }
    }
  })

  // Sort items: folders first, then files, both alphabetically
  const sortItems = (items: FileSystemItem[]): FileSystemItem[] => {
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    }).map(item => ({
      ...item,
      children: item.children ? sortItems(item.children) : undefined
    }))
  }

  return sortItems(rootItems)
}

/**
 * Flattens file tree for search purposes
 */
export function flattenFileTree(items: FileSystemItem[]): FileSystemItem[] {
  const result: FileSystemItem[] = []
  
  const traverse = (items: FileSystemItem[]) => {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  
  traverse(items)
  return result
}

/**
 * Filters file tree based on search query
 */
export function filterFileTree(items: FileSystemItem[], query: string): FileSystemItem[] {
  if (!query.trim()) {
    return items
  }

  const lowerQuery = query.toLowerCase()
  
  const filterItems = (items: FileSystemItem[]): FileSystemItem[] => {
    return items.reduce((acc: FileSystemItem[], item) => {
      const matchesQuery = item.name.toLowerCase().includes(lowerQuery)
      const filteredChildren = item.children ? filterItems(item.children) : undefined
      
      if (matchesQuery || (filteredChildren && filteredChildren.length > 0)) {
        acc.push({
          ...item,
          children: filteredChildren
        })
      }
      
      return acc
    }, [])
  }
  
  return filterItems(items)
}
