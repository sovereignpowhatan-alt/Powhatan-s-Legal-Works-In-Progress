import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as llm from '../services/llm.js';

const router = Router();

router.post('/chat', requireAuth, async (req, res) => {
  const { provider, model, messages } = req.body || {};
  if (!provider || !messages) return res.status(400).json({ error: 'Missing provider/messages' });
  try {
    const result = await llm.chat({ provider, model, messages });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'LLM error' });
  }
});

export const llmRouter = router;