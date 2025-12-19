/**
 * VOID OS Virtual File System
 */

export type VoidFileType = 
  | 'contact'
  | 'project'
  | 'invoice'
  | 'estimate'
  | 'contract'
  | 'template'
  | 'folder'
  | 'smartfolder'

export interface VoidFile {
  id: string
  name: string
  type: VoidFileType
  path: string
  parentId: string | null
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
}

const ROOT_PATH = '/VOID'

/**
 * Create file system structure
 */
export function createFileSystem(): VoidFile[] {
  const now = Date.now()
  
  return [
    // Root folders
    {
      id: 'root',
      name: 'VOID',
      type: 'folder',
      path: ROOT_PATH,
      parentId: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    // Customers
    {
      id: 'customers-root',
      name: 'Customers',
      type: 'folder',
      path: `${ROOT_PATH}/Customers`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'customers-active',
      name: 'Active',
      type: 'folder',
      path: `${ROOT_PATH}/Customers/Active`,
      parentId: 'customers-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'customers-archived',
      name: 'Archived',
      type: 'folder',
      path: `${ROOT_PATH}/Customers/Archived`,
      parentId: 'customers-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'customers-vip',
      name: 'VIP',
      type: 'folder',
      path: `${ROOT_PATH}/Customers/VIP`,
      parentId: 'customers-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    // Leads
    {
      id: 'leads-root',
      name: 'Leads',
      type: 'folder',
      path: `${ROOT_PATH}/Leads`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'leads-hot',
      name: 'Hot',
      type: 'folder',
      path: `${ROOT_PATH}/Leads/Hot`,
      parentId: 'leads-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'leads-warm',
      name: 'Warm',
      type: 'folder',
      path: `${ROOT_PATH}/Leads/Warm`,
      parentId: 'leads-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'leads-cold',
      name: 'Cold',
      type: 'folder',
      path: `${ROOT_PATH}/Leads/Cold`,
      parentId: 'leads-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    // Documents
    {
      id: 'documents-root',
      name: 'Documents',
      type: 'folder',
      path: `${ROOT_PATH}/Documents`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'documents-contracts',
      name: 'Contracts',
      type: 'folder',
      path: `${ROOT_PATH}/Documents/Contracts`,
      parentId: 'documents-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'documents-invoices',
      name: 'Invoices',
      type: 'folder',
      path: `${ROOT_PATH}/Documents/Invoices`,
      parentId: 'documents-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'documents-estimates',
      name: 'Estimates',
      type: 'folder',
      path: `${ROOT_PATH}/Documents/Estimates`,
      parentId: 'documents-root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    // Other folders
    {
      id: 'projects-root',
      name: 'Projects',
      type: 'folder',
      path: `${ROOT_PATH}/Projects`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'templates-root',
      name: 'Templates',
      type: 'folder',
      path: `${ROOT_PATH}/Templates`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'trash-root',
      name: 'Trash',
      type: 'folder',
      path: `${ROOT_PATH}/Trash`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'system-root',
      name: 'System',
      type: 'folder',
      path: `${ROOT_PATH}/System`,
      parentId: 'root',
      metadata: {},
      createdAt: now,
      updatedAt: now,
    },
  ]
}

/**
 * Get files by parent
 */
export function getFilesByParent(files: VoidFile[], parentId: string | null): VoidFile[] {
  return files.filter(file => file.parentId === parentId)
}

/**
 * Get file by path
 */
export function getFileByPath(files: VoidFile[], path: string): VoidFile | undefined {
  return files.find(file => file.path === path)
}

/**
 * Create file
 */
export function createFile(
  files: VoidFile[],
  name: string,
  type: VoidFileType,
  parentId: string | null
): VoidFile {
  const parent = parentId ? files.find(f => f.id === parentId) : null
  const parentPath = parent ? parent.path : ROOT_PATH
  const path = `${parentPath}/${name}`
  
  const file: VoidFile = {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name,
    type,
    path,
    parentId,
    metadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  
  return file
}

/**
 * Delete file
 */
export function deleteFile(files: VoidFile[], fileId: string): VoidFile[] {
  // Move to trash instead of deleting
  const file = files.find(f => f.id === fileId)
  if (!file) return files
  
  const trash = files.find(f => f.name === 'Trash' && f.type === 'folder')
  if (trash) {
    return files.map(f =>
      f.id === fileId
        ? { ...f, parentId: trash.id, path: `${trash.path}/${f.name}` }
        : f
    )
  }
  
  return files.filter(f => f.id !== fileId)
}

/**
 * Move file
 */
export function moveFile(
  files: VoidFile[],
  fileId: string,
  newParentId: string | null
): VoidFile[] {
  const file = files.find(f => f.id === fileId)
  if (!file) return files
  
  const newParent = newParentId ? files.find(f => f.id === newParentId) : null
  const newPath = newParent ? `${newParent.path}/${file.name}` : `${ROOT_PATH}/${file.name}`
  
  return files.map(f =>
    f.id === fileId
      ? { ...f, parentId: newParentId, path: newPath }
      : f
  )
}
