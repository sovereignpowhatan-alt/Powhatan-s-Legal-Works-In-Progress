# Luma Cloud

A playful, zany yet practical cloud workspace for coders. Store and browse massive code directories, chat with built-in AI, connect to external LLMs, and access your files from any device or terminal.

## Features
- Cloud storage backed by S3/MinIO with server-side encryption
- Web UI (React + Vite) with language toggle (i18n)
- File browser optimized for coding projects (default Python UX)
- Connect to external LLMs (OpenAI, Anthropic, Mistral, OpenRouter, Azure OpenAI, Google) or local Ollama
- Built-in lightweight assistant via Ollama small models (e.g., phi3-mini, llama3.2-1b)
- WebDAV endpoint for easy mounting via rclone/davfs2
- Python CLI: browse, upload/download, and chat with LLM
- Docker Compose for one-command bring-up (server + MinIO + Ollama)

## Quickstart

1) Prereqs: Docker, Docker Compose, Node 18+, Python 3.10+

2) Copy env example and adjust as needed:

```bash
cp .env.example .env
```

3) Start stack:

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

4) Install web and server deps (optional if building locally):

```bash
cd server && npm i && cd ../web && npm i && cd ..
```

5) Run dev locally (without Docker):

```bash
# Terminal 1
cd server && npm run dev
# Terminal 2
cd web && npm run dev
```

6) Install CLI:

```bash
cd cli
pip install -e .
```

7) Login (default demo user):

```bash
luma login --server http://localhost:8787 --username demo --password demo
```

8) Use CLI:

```bash
luma ls /
luma upload ./myproject /projects/myproject
luma chat "Help me scaffold a Python API"
```

## Notes
- To mount via WebDAV: use rclone or davfs2 against `http://localhost:8787/webdav/`.
- To use local models: ensure the `ollama` container is running; select Ollama in settings.
- VPN capability is provided via a companion WireGuard service (optional; see `infra/` docs). This requires host permissions and is not enabled by default.