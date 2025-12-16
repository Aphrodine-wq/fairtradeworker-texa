import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lightweight stub for Spark runtime hooks so the client stops logging 405/401s in prod.
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Spark-Initial');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const slug = Array.isArray(req.query.slug)
    ? req.query.slug
    : req.query.slug
      ? [req.query.slug]
      : [];

  const [resource, ...rest] = slug;

  switch (resource) {
    case 'loaded': {
      return res.status(204).end();
    }
    case 'user': {
      return res.status(200).json({ id: null });
    }
    case 'kv': {
      // GET /_spark/kv -> list; GET /_spark/kv/:key -> 404 (absent)
      if (rest.length === 0) {
        if (req.method === 'GET') {
          return res.status(200).json([]);
        }
        return res.status(200).json({ ok: true });
      }
      if (req.method === 'GET') {
        return res.status(404).end();
      }
      return res.status(200).json({ ok: true });
    }
    case 'llm': {
      // Minimal LLM echo to satisfy the client contract
      return res.status(200).json({
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      });
    }
    default: {
      return res.status(204).end();
    }
  }
}
