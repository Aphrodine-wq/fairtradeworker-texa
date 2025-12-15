/**
 * Provider configuration for hosted inference and vector services.
 * These defaults favor hosted APIs first (Groq/Together/Fireworks/Anthropic).
 * Switch to self-hosted by overriding endpoints in env/config.
 */

export interface ProviderConfig {
  routing: {
    provider: 'groq' | 'together' | 'fireworks';
    model: string;
    baseUrl?: string;
    apiKey?: string;
  };
  embeddings: {
    provider: 'together' | 'fireworks';
    model: string;
    baseUrl?: string;
    apiKey?: string;
  };
  background: {
    provider: 'together' | 'fireworks';
    model: string;
    baseUrl?: string;
    apiKey?: string;
  };
  scoping: {
    provider: 'anthropic';
    model: string;
    apiKey?: string;
    maxTokens?: number;
  };
  vector: {
    provider: 'pinecone' | 'qdrant' | 'weaviate' | 'chroma';
    apiKey?: string;
    baseUrl?: string;
    indexJobScopes?: string;
    indexMaterials?: string;
    indexContractors?: string;
  };
}

// Environment-driven defaults (hosted-first)
export const providerConfig: ProviderConfig = {
  routing: {
    provider: (process.env.FTW_ROUTING_PROVIDER as ProviderConfig['routing']['provider']) || 'groq',
    model: process.env.FTW_ROUTING_MODEL || 'mixtral-8x7b-32768',
    baseUrl: process.env.FTW_ROUTING_URL,
    apiKey: process.env.FTW_ROUTING_KEY,
  },
  embeddings: {
    provider: (process.env.FTW_EMBED_PROVIDER as ProviderConfig['embeddings']['provider']) || 'together',
    model: process.env.FTW_EMBED_MODEL || 'togethercomputer/m2-bert-80M-8k-retrieval',
    baseUrl: process.env.FTW_EMBED_URL,
    apiKey: process.env.FTW_EMBED_KEY,
  },
  background: {
    provider: (process.env.FTW_BG_PROVIDER as ProviderConfig['background']['provider']) || 'fireworks',
    model: process.env.FTW_BG_MODEL || 'accounts/fireworks/models/mistral-7b-instruct-v0p2',
    baseUrl: process.env.FTW_BG_URL,
    apiKey: process.env.FTW_BG_KEY,
  },
  scoping: {
    provider: 'anthropic',
    model: process.env.FTW_SCOPING_MODEL || 'claude-3-5-sonnet-20241022',
    apiKey: process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY,
    maxTokens: Number(process.env.FTW_SCOPING_MAX_TOKENS || 500),
  },
  vector: {
    provider: (process.env.FTW_VECTOR_PROVIDER as ProviderConfig['vector']['provider']) || 'pinecone',
    apiKey: process.env.FTW_VECTOR_KEY,
    baseUrl: process.env.FTW_VECTOR_URL,
    indexJobScopes: process.env.FTW_VECTOR_INDEX_SCOPES || 'ftw-job-scopes',
    indexMaterials: process.env.FTW_VECTOR_INDEX_MATERIALS || 'ftw-materials',
    indexContractors: process.env.FTW_VECTOR_INDEX_CONTRACTORS || 'ftw-contractors',
  },
};

export interface ProviderSwitches {
  enableRouting: boolean;
  enableEmbeddings: boolean;
  enableRag: boolean;
  enableBackground: boolean;
  enableMatching: boolean;
}

export const providerSwitches: ProviderSwitches = {
  enableRouting: process.env.FTW_ENABLE_ROUTING !== 'false',
  enableEmbeddings: process.env.FTW_ENABLE_EMBEDDINGS !== 'false',
  enableRag: process.env.FTW_ENABLE_RAG !== 'false',
  enableBackground: process.env.FTW_ENABLE_BACKGROUND !== 'false',
  enableMatching: process.env.FTW_ENABLE_MATCHING !== 'false',
};
