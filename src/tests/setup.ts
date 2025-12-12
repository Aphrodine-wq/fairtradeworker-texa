import { beforeEach, afterEach, vi } from 'vitest'

// Create an in-memory store for testing with proper typing
type KVStoreValue = unknown
const kvStore = new Map<string, KVStoreValue>()

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  kvStore.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

export const mockSpark = {
  kv: {
    get: vi.fn(async <T = KVStoreValue>(key: string): Promise<T | undefined> => {
      return kvStore.get(key) as T | undefined
    }),
    set: vi.fn(async <T = KVStoreValue>(key: string, value: T): Promise<boolean> => {
      kvStore.set(key, value)
      return true
    }),
    delete: vi.fn(async (key: string): Promise<boolean> => {
      kvStore.delete(key)
      return true
    }),
    keys: vi.fn(async (): Promise<string[]> => {
      return Array.from(kvStore.keys())
    })
  },
  llm: vi.fn(),
  llmPrompt: vi.fn((strings: TemplateStringsArray, ...values: any[]) => 
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  ),
  user: vi.fn()
}

global.spark = mockSpark as any
