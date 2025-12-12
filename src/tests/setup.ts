import { beforeEach, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

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
    get: vi.fn(async (key: string) => kvStore.get(key)),
    set: vi.fn(async (key: string, value: any) => {
      kvStore.set(key, value)
      return value
    }),
    delete: vi.fn(async (key: string) => kvStore.delete(key)),
    keys: vi.fn(async () => Array.from(kvStore.keys()))
  },
  llm: vi.fn(),
  llmPrompt: vi.fn((strings: TemplateStringsArray, ...values: any[]) => 
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  ),
  user: vi.fn()
}

global.spark = mockSpark as any
;(globalThis as any).spark = mockSpark
if (typeof window !== 'undefined') {
  ;(window as any).spark = mockSpark
}
