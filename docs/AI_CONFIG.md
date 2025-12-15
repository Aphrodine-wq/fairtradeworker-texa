# AI Configuration (Hosted-First)

Set these environment variables to enable the hosted routing/RAG/CRM stack. All features degrade gracefully when keys are absent.

## Core Providers
- `FTW_ROUTING_KEY` / `FTW_ROUTING_MODEL` / `FTW_ROUTING_URL` (Groq/Together/Fireworks)
- `FTW_EMBED_KEY` / `FTW_EMBED_MODEL` / `FTW_EMBED_URL` (Together/Fireworks embeddings)
- `FTW_BG_KEY` / `FTW_BG_MODEL` / `FTW_BG_URL` (Background LLM for CRM/follow-ups)
- `CLAUDE_API_KEY` (or `VITE_CLAUDE_API_KEY`) for scoping

## Vector DB (Hosted)
- `FTW_VECTOR_PROVIDER` (pinecone/qdrant/weaviate/chroma)
- `FTW_VECTOR_KEY`
- `FTW_VECTOR_URL` (HTTP endpoint for query/upsert)
- `FTW_VECTOR_INDEX_SCOPES` (default: `ftw-job-scopes`)
- `FTW_VECTOR_INDEX_MATERIALS` (default: `ftw-materials`)
- `FTW_VECTOR_INDEX_CONTRACTORS` (default: `ftw-contractors`)

## Feature Flags (optional)
- `FTW_ENABLE_ROUTING` (default true)
- `FTW_ENABLE_EMBEDDINGS` (default true)
- `FTW_ENABLE_RAG` (default true)
- `FTW_ENABLE_BACKGROUND` (default true)
- `FTW_ENABLE_MATCHING` (default true)

## Notes
- Start hosted-first to avoid infra setup; swap to self-hosted by overriding URLs and providers.
- Missing keys disable the corresponding layer without breaking the app.
- Vector API is expected to accept `{ index, vector, topK, filter }` POST; adjust `ragContext.ts`/`contractorMatch.ts` if your provider differs.
