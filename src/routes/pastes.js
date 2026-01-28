import express from "express";
import { redis } from "../db.js";
import { nanoid } from "nanoid";
import { now } from "../utils/time.js";

const router = express.Router();

/* ---------- HELPERS ---------- */

function escapeHtml(str){
  return str.replace(/[&<>"']/g, m =>
   ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}

/* ---------- CREATE PASTE ---------- */

router.post("/", async (req,res)=>{
  const { content, ttl_seconds, max_views } = req.body;

  if(!content || typeof content !== "string")
    return res.status(400).json({ error:"Invalid content" });

  if(ttl_seconds && ttl_seconds < 1)
    return res.status(400).json({ error:"Invalid ttl_seconds" });

  if(max_views && max_views < 1)
    return res.status(400).json({ error:"Invalid max_views" });

  const id = nanoid(8);

  const expiresAt = ttl_seconds
    ? Date.now() + ttl_seconds * 1000
    : null;

  const paste = {
    content,
    expiresAt,
    remainingViews: max_views ?? null
  };

  await redis.set(`paste:${id}`, paste);

  res.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`
  });
});

/* ---------- FETCH PASTE (API) ---------- */

router.get("/:id", async (req,res)=>{
  const id = req.params.id;

  const paste = await redis.get(`paste:${id}`);
  if(!paste)
    return res.status(404).json({ error:"Not found" });

  const current = now(req);

  if(paste.expiresAt && current > paste.expiresAt)
    return res.status(404).json({ error:"Expired" });

  if(paste.remainingViews !== null){
    if(paste.remainingViews <= 0)
      return res.status(404).json({ error:"No views left" });

    paste.remainingViews--;
    await redis.set(`paste:${id}`, paste);
  }

  res.json({
    content: paste.content,
    remaining_views: paste.remainingViews,
    expires_at: paste.expiresAt
      ? new Date(paste.expiresAt).toISOString()
      : null
  });
});

/* ---------- HTML VIEW ---------- */

router.get("/p/:id", async (req,res)=>{
  const id = req.params.id;

  const paste = await redis.get(`paste:${id}`);
  if(!paste)
    return res.sendStatus(404);

  const current = now(req);

  if(paste.expiresAt && current > paste.expiresAt)
    return res.sendStatus(404);

  if(paste.remainingViews !== null){
    if(paste.remainingViews <= 0)
      return res.sendStatus(404);

    paste.remainingViews--;
    await redis.set(`paste:${id}`, paste);
  }

  res.send(`
    <html>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `);
});

export default router;
