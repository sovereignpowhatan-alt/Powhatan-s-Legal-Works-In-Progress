import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

const router = Router();

// In-memory demo storage; replace with DB in production
const users = new Map<string, { id: string; username: string; passwordHash: string }>();
const demoHash = bcrypt.hashSync('demo', 10);
users.set('demo', { id: 'u_demo', username: 'demo', passwordHash: demoHash });

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  if (users.has(username)) return res.status(409).json({ error: 'User exists' });
  const id = `u_${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  users.set(username, { id, username, passwordHash });
  return res.json({ ok: true });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const u = users.get(username);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: u.id, username: u.username }, config.jwtSecret, { expiresIn: '7d' });
  return res.json({ token });
});

export const authRouter = router;