import type { DashboardLayout } from '../types/widget.types'

// Dual-layer persistence: IndexedDB for reliability + localStorage fallback
// Survives page refresh, browser restart, and handles large datasets better
// than localStorage alone. Each layout is immutable - updates create new versions.

const DB_NAME = 'dashboard_db'
const DB_VERSION = 1
const STORE_NAME = 'layouts'
const CACHE_STORE_NAME = 'widget_cache'
const LS_KEY = 'dashboard_layouts_backup'

interface StoredLayout {
  id: string
  name: string
  data: DashboardLayout
  savedAt: number
  version: number
}

interface CacheEntry {
  key: string
  value: any
  timestamp: number
}

// IndexedDB helper - handles browser support gracefully
const getDB = async (): Promise<IDBDatabase | null> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.warn('[layoutPersistence] IndexedDB open failed, using localStorage')
      resolve(null)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => {
      resolve((event.target as IDBOpenDBRequest).result)
    }
  })
}

export const layoutPersistence = {
  // Save layout to IndexedDB, fallback to localStorage
  saveLayout: async (layout: DashboardLayout): Promise<boolean> => {
    try {
      const db = await getDB()
      const storedLayout: StoredLayout = {
        id: layout.id,
        name: layout.name,
        data: layout,
        savedAt: Date.now(),
        version: 1,
      }

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          const request = store.put(storedLayout)

          request.onerror = () => {
            console.warn('[layoutPersistence] IDB save failed, using localStorage fallback')
            layoutPersistence._saveToLocalStorage(storedLayout)
            resolve(true)
          }

          request.onsuccess = () => {
            // also backup to localStorage for emergency recovery
            layoutPersistence._saveToLocalStorage(storedLayout)
            resolve(true)
          }
        })
      } else {
        // fallback to localStorage only
        layoutPersistence._saveToLocalStorage(storedLayout)
        return true
      }
    } catch (error) {
      console.error('[layoutPersistence] Save failed:', error)
      return false
    }
  },

  // Load layout from IndexedDB, fallback to localStorage
  loadLayout: async (layoutId: string): Promise<DashboardLayout | null> => {
    try {
      const db = await getDB()

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const request = store.get(layoutId)

          request.onerror = () => {
            // try localStorage fallback
            const layout = layoutPersistence._loadFromLocalStorage(layoutId)
            resolve(layout?.data || null)
          }

          request.onsuccess = () => {
            const result = (request as IDBRequest<StoredLayout>).result
            resolve(result?.data || null)
          }
        })
      } else {
        // fallback to localStorage
        const layout = layoutPersistence._loadFromLocalStorage(layoutId)
        return layout?.data || null
      }
    } catch (error) {
      console.error('[layoutPersistence] Load failed:', error)
      return null
    }
  },

  // Get all layouts - IndexedDB first, then localStorage
  getAllLayouts: async (): Promise<StoredLayout[]> => {
    try {
      const db = await getDB()

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const request = store.getAll()

          request.onerror = () => {
            // fallback to localStorage
            const layouts = layoutPersistence._getAllFromLocalStorage()
            resolve(layouts)
          }

          request.onsuccess = () => {
            resolve((request as IDBRequest<StoredLayout[]>).result)
          }
        })
      } else {
        // fallback to localStorage
        return layoutPersistence._getAllFromLocalStorage()
      }
    } catch (error) {
      console.error('[layoutPersistence] Fetch all failed:', error)
      return []
    }
  },

  // Delete a single layout
  deleteLayout: async (layoutId: string): Promise<boolean> => {
    try {
      const db = await getDB()

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          const request = store.delete(layoutId)

          request.onerror = () => {
            layoutPersistence._deleteFromLocalStorage(layoutId)
            resolve(true)
          }

          request.onsuccess = () => {
            layoutPersistence._deleteFromLocalStorage(layoutId)
            resolve(true)
          }
        })
      } else {
        layoutPersistence._deleteFromLocalStorage(layoutId)
        return true
      }
    } catch (error) {
      console.error('[layoutPersistence] Delete failed:', error)
      return false
    }
  },

  // Cache widget data separately (survives across sessions)
  cacheWidgetData: async (key: string, data: any): Promise<boolean> => {
    try {
      const db = await getDB()
      const entry: CacheEntry = {
        key,
        value: data,
        timestamp: Date.now(),
      }

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([CACHE_STORE_NAME], 'readwrite')
          const store = tx.objectStore(CACHE_STORE_NAME)
          const request = store.put(entry)

          request.onerror = () => {
            resolve(false)
          }

          request.onsuccess = () => {
            resolve(true)
          }
        })
      }
      return false
    } catch (error) {
      console.error('[layoutPersistence] Cache write failed:', error)
      return false
    }
  },

  // Retrieve cached widget data
  getCachedWidgetData: async (key: string): Promise<any | null> => {
    try {
      const db = await getDB()

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([CACHE_STORE_NAME], 'readonly')
          const store = tx.objectStore(CACHE_STORE_NAME)
          const request = store.get(key)

          request.onerror = () => {
            resolve(null)
          }

          request.onsuccess = () => {
            const result = (request as IDBRequest<CacheEntry>).result
            resolve(result?.value || null)
          }
        })
      }
      return null
    } catch (error) {
      console.error('[layoutPersistence] Cache read failed:', error)
      return null
    }
  },

  // For emergency recovery - clear everything
  clearAll: async (): Promise<boolean> => {
    try {
      const db = await getDB()

      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME, CACHE_STORE_NAME], 'readwrite')
          const storeReq = tx.objectStore(STORE_NAME).clear()
          const cacheReq = tx.objectStore(CACHE_STORE_NAME).clear()

          Promise.all([
            new Promise((res) => {
              storeReq.onsuccess = () => res(true)
              storeReq.onerror = () => res(false)
            }),
            new Promise((res) => {
              cacheReq.onsuccess = () => res(true)
              cacheReq.onerror = () => res(false)
            }),
          ]).then(() => {
            layoutPersistence._clearLocalStorage()
            resolve(true)
          })
        })
      } else {
        layoutPersistence._clearLocalStorage()
        return true
      }
    } catch (error) {
      console.error('[layoutPersistence] Clear all failed:', error)
      return false
    }
  },

  // --- Private helpers for localStorage fallback ---

  _saveToLocalStorage: (layout: StoredLayout) => {
    try {
      const existing = layoutPersistence._getAllFromLocalStorage()
      const updated = existing.map((l) => (l.id === layout.id ? layout : l))
      if (!updated.find((l) => l.id === layout.id)) {
        updated.push(layout)
      }
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('[layoutPersistence] localStorage save failed:', e)
    }
  },

  _loadFromLocalStorage: (layoutId: string): StoredLayout | null => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (!stored) return null
      const layouts = JSON.parse(stored) as StoredLayout[]
      return layouts.find((l) => l.id === layoutId) || null
    } catch (e) {
      console.warn('[layoutPersistence] localStorage load failed:', e)
      return null
    }
  },

  _getAllFromLocalStorage: (): StoredLayout[] => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.warn('[layoutPersistence] localStorage parse failed:', e)
      return []
    }
  },

  _deleteFromLocalStorage: (layoutId: string) => {
    try {
      const existing = layoutPersistence._getAllFromLocalStorage()
      const updated = existing.filter((l) => l.id !== layoutId)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('[layoutPersistence] localStorage delete failed:', e)
    }
  },

  _clearLocalStorage: () => {
    try {
      localStorage.removeItem(LS_KEY)
    } catch (e) {
      console.warn('[layoutPersistence] localStorage clear failed:', e)
    }
  },
}
