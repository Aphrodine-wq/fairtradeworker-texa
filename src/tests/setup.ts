import { beforeEach, afterEach, vi } from 'vitest'

// Create an in-memory store for testing
const kvStore = new Map<string, any>()

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
    get: vi.fn(async (key: string) => {
      return kvStore.get(key)
    }),
    set: vi.fn(async (key: string, value: any) => {
      kvStore.set(key, value)
      return true
    }),
    delete: vi.fn(async (key: string) => {
      kvStore.delete(key)
      return true
    }),
    keys: vi.fn(async () => {
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
