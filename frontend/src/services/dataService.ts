import type { WidgetDataResponse, WidgetState } from '../types/widget.types'

// Fetches data from backend and handles caching/retry logic
// Keeps API calls organized in one place

const API_BASE = process.env.REACT_APP_API_URL || 'https://dashboard-assignment-ochre.vercel.app/'

interface FetchOptions {
  retries?: number
  timeout?: number
}

class DataService {
  private cache: Map<string, { data: WidgetDataResponse; timestamp: number }> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutes

  async fetchWidgetData(
    dataSource: string,
    options: FetchOptions = {}
  ): Promise<WidgetState> {
    const { retries = 2, timeout = 5000 } = options

    // Check cache first
    const cached = this.cache.get(dataSource)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return {
        isLoading: false,
        error: null,
        data: cached.data.data,
      }
    }

    let lastError: Error | null = null

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(`${API_BASE}/api/data/${dataSource}`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const payload: WidgetDataResponse = await response.json()

        // Cache the result
        this.cache.set(dataSource, {
          data: payload,
          timestamp: Date.now(),
        })

        return {
          isLoading: false,
          error: null,
          data: payload.data,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (i < retries - 1) {
          // exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100))
        }
      }
    }

    return {
      isLoading: false,
      error: lastError?.message || 'Failed to fetch data',
      data: null,
    }
  }

  invalidateCache(dataSource: string) {
    this.cache.delete(dataSource)
  }

  invalidateAllCache() {
    this.cache.clear()
  }
}

export const dataService = new DataService()
