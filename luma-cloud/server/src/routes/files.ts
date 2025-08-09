import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import * as storage from '../services/storage.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/list', requireAuth, async (req, res) => {
  const prefix = (req.query.prefix as string) || '';
  const result = await storage.list(prefix);
  res.json(result);
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const file = req.file;
  const key = (req.body.key as string) || (file?.originalname ?? 'upload.bin');
  if (!file) return res.status(400).json({ error: 'Missing file' });
  await storage.putObject(key, file.buffer, file.mimetype);
  res.json({ ok: true, key });
});

router.get('/download', requireAuth, async (req, res) => {
  const key = (req.query.key as string) || '';
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const url = storage.getSignedUrl(key, 3600);
  res.json({ url });
});

router.delete('/delete', requireAuth, async (req, res) => {
  const key = (req.query.key as string) || '';
  if (!key) return res.status(400).json({ error: 'Missing key' });
  await storage.deleteObject(key);
  res.json({ ok: true });
});

export const filesRouter = router;