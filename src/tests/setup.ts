import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

export const mockSpark = {
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn()
  },
  llm: vi.fn(),
  llmPrompt: vi.fn((strings: TemplateStringsArray, ...values: any[]) => 
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  ),
  user: vi.fn()
}

global.spark = mockSpark as any
