# Pastebin-lite-Clone
A minimal Pastebin-like service that allows users to create text pastes and share a link to view them. Pastes may optionally expire by time (TTL) or by view count.

Deployed using Node.js + Express with Redis (Upstash) persistence.

🚀 Live Demo

https://paste-bin-clone-sandy.vercel.app

Health Check:
https://paste-bin-clone-sandy.vercel.app/api/healthz

✅ Features

Create a paste with arbitrary text

Receive a shareable URL

View paste via API or browser

Optional time-to-live (TTL)

Optional maximum view count

Deterministic time support for testing

Persistent storage using Redis

🧱 Tech Stack

Node.js

Express.js

Upstash Redis

Vercel

📦 API
POST /api/pastes
{
  "content": "hello",
  "ttl_seconds": 60,
  "max_views": 5
}

GET /api/pastes/:id

Returns paste JSON.

GET /p/:id

Returns HTML.

🗄 Persistence Layer

Upstash Redis (REST).

Chosen because it is serverless-safe and persists across requests.

▶ Run Locally
npm install
npm start


Create .env:

UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
BASE_URL=http://localhost:3000

⚙ Design Notes

Redis stores JSON blobs

No in-memory global state

View counts decremented safely

Expiry checked on read

📄 License

MIT
