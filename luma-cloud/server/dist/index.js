import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { filesRouter } from './routes/files.js';
import { llmRouter } from './routes/llm.js';
const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/api/files', filesRouter);
app.use('/api/llm', llmRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(config.port, () => {
    console.log(`Luma server listening on :${config.port}`);
});
