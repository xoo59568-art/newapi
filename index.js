const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const dns = require("dns");
const crypto = require("crypto");
const gis = require("g-i-s");
const multer = require("multer");
const FormData = require("form-data");

const app = express();
app.disable("x-powered-by");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  pingTimeout: 20000,
  pingInterval: 15000
});

global.botSockets = new Map();
let SERVER_COUNT = 0;
const PORT = process.env.PORT || 4000;

app.set("trust proxy", true);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const CREATOR = "𓋜 -𝐑ᴀ፝֟፝֟ʙʙɪᴛ/>𝟑ن𓂃";

// Browser-like headers for calls to jerrycoder.oggyapi.workers.dev —
// some Cloudflare-protected workers block plain "axios/Mozilla" UAs
// or requests missing Referer/Origin, so we mimic a real browser.
const JERRY_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://jerrycoder.oggyapi.workers.dev/",
  "Origin": "https://jerrycoder.oggyapi.workers.dev"
};


const mediaCache = new Map();

function randomId(len = 5, ext = ".mp3") {
  // crypto.randomBytes is faster than a per-character Math.random loop,
  // and with this much entropy a collision-check against mediaCache
  // is unnecessary overhead — the odds are astronomically low.
  return crypto.randomBytes(Math.ceil(len * 0.75)).toString("base64url").slice(0, len);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERIC MEDIA PROXY CACHE
// (same pattern as /api/song)
// Caches a remote URL and returns
// your own domain proxy link that
// streams it through /media/:file
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
function cacheMedia(req, sourceUrl, ext = ".mp4", ttlMs = 10 * 60 * 1000) {
  if (!sourceUrl) return null;

  const id = randomId(5, ext);
  const file = id + ext;

  mediaCache.set(file, sourceUrl);

  setTimeout(() => {
    mediaCache.delete(file);
  }, ttlMs);

  return `${req.protocol}://${req.get("host")}/media/${file}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUFFER-BASED MEDIA CACHE
// For upstream APIs that stream
// raw bytes back directly instead
// of returning a JSON URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
function cacheBufferMedia(req, buffer, contentType = "application/octet-stream", ext = ".png", ttlMs = 10 * 60 * 1000) {
  if (!buffer) return null;

  const id = randomId(5, ext);
  const file = id + ext;

  mediaCache.set(file, { buffer, contentType });

  setTimeout(() => {
    mediaCache.delete(file);
  }, ttlMs);

  return `${req.protocol}://${req.get("host")}/media/${file}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTPS AGENT — no keepAlive
// (used only for the screenshot tool,
// which hits arbitrary one-off sites)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const ssAgent = new https.Agent({
  keepAlive: false,
  maxSockets: 10,
  maxFreeSockets: 0,
  timeout: 30000
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEEP-ALIVE AGENTS — for all
// other outbound API calls.
// Reuses TCP/TLS connections to the
// same upstream host instead of
// renegotiating on every request —
// meaningfully faster under load.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const keepAliveHttpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 30000
});
const keepAliveHttpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 30000
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// DNS CACHE — skips a fresh DNS
// lookup on every outbound call to
// the same upstream host
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const dnsCache = new Map();
const DNS_TTL = 5 * 60 * 1000;

function cachedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  const hit = dnsCache.get(hostname);
  if (hit && Date.now() - hit.time < DNS_TTL) {
    return callback(null, hit.address, hit.family);
  }

  dns.lookup(hostname, options, (err, address, family) => {
    if (!err) dnsCache.set(hostname, { address, family, time: Date.now() });
    callback(err, address, family);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// AXIOS DEFAULT CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const ax = axios.create({
  timeout: 30000,
  headers: { "User-Agent": "Mozilla/5.0" },
  maxRedirects: 5,
  decompress: true,
  httpsAgent: keepAliveHttpsAgent,
  httpAgent: keepAliveHttpAgent,
  lookup: cachedLookup
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// NO-CACHE HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
function noCache(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// STREAM DESTROY HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
function safeDestroy(stream) {
  try {
    if (stream && !stream.destroyed) stream.destroy();
  } catch (_) {}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTO MEMORY CLEANUP — 30s
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
setInterval(() => {
  // Dead socket cleanup
  for (const [id, bot] of global.botSockets.entries()) {
    if (!bot.socket.connected) {
      global.botSockets.delete(id);
    }
  }

  // Force GC if exposed
  if (global.gc) {
    try { global.gc(); } catch (_) {}
  }

  console.clear();
}, 30000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 HOSTING / DATACENTER IP BLOCKER
// Blocks requests coming from known cloud
// hosting providers (Render, Heroku, AWS,
// GCP, Azure, DigitalOcean, etc.) so people
// can't run a proxy/wrapper of this API from
// their own server. Real users on residential
// or mobile networks pass through untouched.
//
// NOTE: this is a best-effort heuristic based
// on the requester IP's ISP/Org name — it is
// NOT as strong as Cloudflare's ASN-level bot
// blocking, and a determined attacker can route
// around it. Pair with rate-limiting for real
// abuse protection.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ipCheckCache = new Map(); // ip -> { blocked, time }
const IP_CHECK_TTL = 60 * 60 * 1000; // re-check each IP once per hour

const HOSTING_KEYWORDS = [
  "amazon", "aws", "google cloud", "google llc", "microsoft", "azure",
  "digitalocean", "linode", "akamai", "vultr", "ovh", "hetzner",
  "render", "heroku", "railway", "vercel", "netlify", "fly.io", "fly io",
  "contabo", "hostinger", "oracle cloud", "alibaba", "tencent",
  "scaleway", "leaseweb", "choopa", "packet", "upcloud", "salad",
  "datacamp", "psychz", "colocrossing", "server", "hosting"
];

// Never block these even if flagged — avoids accidentally
// locking out normal ISPs whose names happen to contain a keyword
const ALLOW_KEYWORDS = ["mobile", "wireless", "broadband", "telecom", "fiber", "cable"];

async function isHostingIP(ip) {
  if (!ip) return false;

  // Always allow local/private IPs (health checks, same-machine calls)
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return false;
  }

  const cached = ipCheckCache.get(ip);
  if (cached && Date.now() - cached.time < IP_CHECK_TTL) {
    return cached.blocked;
  }

  try {
    const { data } = await ax.get(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=isp,org,as,proxy,hosting`,
      { timeout: 3000 }
    );

    const text = `${data.isp || ""} ${data.org || ""} ${data.as || ""}`.toLowerCase();

    const isAllowed = ALLOW_KEYWORDS.some(k => text.includes(k));
    const isFlagged =
      data.hosting === true ||
      data.proxy === true ||
      HOSTING_KEYWORDS.some(k => text.includes(k));

    const blocked = isFlagged && !isAllowed;

    ipCheckCache.set(ip, { blocked, time: Date.now() });
    return blocked;
  } catch {
    // If the lookup service itself fails, fail OPEN —
    // never take the whole API down because a checker timed out
    return false;
  }
}

app.use(async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "";
    const blocked = await isHostingIP(ip);

    if (blocked) {
      noCache(res);
      return res.status(403).json({
        success: false,
        creator: CREATOR,
        message: "Access denied — requests from hosting/datacenter IPs are not allowed"
      });
    }

    next();
  } catch {
    next(); // never block traffic because our own middleware errored
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/", (req, res) => {
  noCache(res);
  res.sendFile(__dirname + "/index.html");
});
app.get("/ads.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    "google.com, pub-1090659711705372, DIRECT, f08c47fec0942fa0"
  );
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`
User-agent: *
Allow: /

Sitemap: https://rabbitapi.zone.id/sitemap.xml
`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://rabbitapi.zone.id/</loc>
<priority>1.0</priority>
</url>
</urlset>`);
});




app.get("/upload", (req, res) => {
  noCache(res);
  res.sendFile(__dirname + "/upload.html");
});

app.get("/category/downloader", (req, res) => {
  noCache(res);
  res.sendFile(__dirname + "/category/downloader.html");
});

app.get("/removebg", (req, res) => {
  noCache(res);
  res.sendFile(__dirname + "/removebg.html");
});


app.get("/api.html", (req, res) => {
  noCache(res);
  res.sendFile(__dirname + "/api.html");
});





//channel react
app.get("/api/chr", async (req, res) => {

  noCache(res);

  try {

    const { apikey, url, react } = req.query;

    // API KEY REQUIRED
    if (!apikey) {
      return res.status(401).json({
        success: false,
        creator: CREATOR,
        message: "API key required"
      });
    }

    // LOAD KEYS FROM GITHUB
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/xoo59568-art/newapi/refs/heads/main/database/apikeys.txt",
      {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const keys = data
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    // CHECK API KEY
    if (!keys.includes(apikey)) {
      return res.status(403).json({
        success: false,
        creator: CREATOR,
        message: "Invalid API key"
      });
    }

    // PARAM CHECK
    if (!url) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "Channel URL required"
      });
    }

    if (!react) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "Reaction required"
      });
    }

    // BACKEND REQUEST
    const api =
      `http://66.78.41.20:3000/api/chr?url=${encodeURIComponent(url)}&react=${encodeURIComponent(react)}`;

    const response = await axios.get(api, {
      timeout: 180000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.json({
      success: true,
      creator: CREATOR,
      result: response.data
    });

  } catch (err) {

    if (err.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        creator: CREATOR,
        message: "Request timeout after 3 minutes"
      });
    }

    return res.status(500).json({
      success: false,
      creator: CREATOR,
      error: err.message
    });

  }

});





// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 PAIR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


app.get("/api/pair", async (req, res) => {

  noCache(res);

  try {

    const { number } = req.query;

    if (!number) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "Number required"
      });
    }

    // hidden backend request
    const api =
      `http://66.78.41.20:3000/pair/${number}`;

    const response = await axios.get(api, {

      // 3 MINUTE TIMEOUT
      timeout: 180000,

      headers: {
        "User-Agent": "Mozilla/5.0"
      }

    });

    const data = response.data;

    if (!data?.code) {
      return res.status(404).json({
        success: false,
        creator: CREATOR,
        message: "Pair code not found"
      });
    }

    return res.json({
      success: true,
      creator: CREATOR,

      result: {
        number: data.phone || number,
        code: data.code
      }
    });

  } catch (err) {

    if (err.code === "ECONNABORTED") {

      return res.status(408).json({
        success: false,
        creator: CREATOR,
        message: "Request timeout after 3 minutes"
      });

    }

    return res.status(500).json({
      success: false,
      creator: CREATOR,
      error: err.message
    });

  }

});


// Add below your multer config

app.all("/api/fullpp/pair", upload.single("image"), async (req, res) => {
noCache(res);

let imageBase64 = null;

try {
// number from query or form-data
const number =
req.query.number ||
req.body.number;

// image URL from query or body
const imageUrl =
  req.query.url ||
  req.body.url;

if (!number) {
  return res.status(400).json({
    success: false,
    creator: CREATOR,
    message: "Number required"
  });
}

// ─────────────────────────
// URL MODE
// GET /api/fullpp/pair?number=9173&url=https://...
// ─────────────────────────
if (imageUrl) {
  const img = await ax.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 30000
  });

  const type =
    img.headers["content-type"] ||
    "image/jpeg";

  imageBase64 =
    `data:${type};base64,` +
    Buffer.from(img.data).toString("base64");
}

// ─────────────────────────
// UPLOAD MODE
// POST /api/fullpp/pair
// form-data:
// number=9173
// image=@photo.jpg
// ─────────────────────────
else if (req.file) {
  imageBase64 =
    `data:${req.file.mimetype};base64,` +
    req.file.buffer.toString("base64");
}

else {
  return res.status(400).json({
    success: false,
    creator: CREATOR,
    message: "URL or image file required"
  });
}

// Send to upstream API
const { data } = await ax.post(
  "https://wpfullpp.zone.id/api/pair",
  {
    phone: number,
    imageBase64
  },
  {
    timeout: 180000,
    headers: {
      "Content-Type": "application/json"
    }
  }
);

return res.json({
  success: true,
  creator: CREATOR,
  result: data
});

} catch (e) {
return res.status(500).json({
success: false,
creator: CREATOR,
error: e.message
});
} finally {
imageBase64 = null;

if (req.file) {
  req.file.buffer = null;
  req.file = null;
}

}
});




// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 ALL DOWNLOAD 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━





app.get("/api/dwnall", async (req, res) => {
  noCache(res);

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "URL required"
      });
    }

    const api = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`;

    const response = await ax.get(api, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const data = response.data;

    if (!data?.status || !data?.data) {
      return res.status(404).json({
        success: false,
        creator: CREATOR,
        message: "Media not found"
      });
    }

    const result = data.data;

    const ss = cacheMedia(req, result.low || null, ".mp4");
    const hd = cacheMedia(req, result.high || null, ".mp4");
    const thumbnail = cacheMedia(req, result.thumbnail || null, ".jpg");

    return res.json({
      success: true,
      creator: CREATOR,

      result: {
        title: result.title || "Unknown",
        thumbnail,

        ss,
        hd
      }
    });

  } catch (err) {

    if (err.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        creator: CREATOR,
        message: "Request timeout"
      });
    }

    return res.status(500).json({
      success: false,
      creator: CREATOR,
      error: err.message
    });
  }
});











// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 INSTAGRAM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/instagram", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.result, ".mp4");

    res.json({ status: true, creator: CREATOR, url: proxy });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

app.get("/api/insta", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.data[0].url, ".mp4");
    const thumbnail = cacheMedia(req, data.data[0].thumbnail, ".jpg");

    res.json({
      status: true,
      creator: CREATOR,
      thumbnail,
      url: proxy
    });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

app.get("/api/insta2", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
    );

    const fileExt = data.ext ? `.${data.ext}` : ".mp4";
    const proxy = cacheMedia(req, data.data[0].url, fileExt);
    const thumbnail = cacheMedia(req, data.data[0].thumbnail, ".jpg");

    res.json({
      status: true,
      creator: CREATOR,
      quality: data.quality,
      ext: data.ext,
      thumbnail,
      url: proxy
    });
  } catch (e) {
    res.json({ status: false, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📘 FACEBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/fb", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR, message: "Facebook URL required" });

    const { data } = await ax.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(url)}`,
      { timeout: 120000 }
    );

    const hd = cacheMedia(req, data?.data?.high || null, ".mp4");
    const sd = cacheMedia(req, data?.data?.low || null, ".mp4");

    res.json({
      status: true,
      creator: CREATOR,
      title: data?.data?.title || null,
      thumbnail: data?.data?.thumbnail || null,
      hd,
      sd
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR, message: err.message });
  }
});

app.get("/api/fb2", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://apiskeith.top/download/fbdown?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.result, ".mp4");

    res.json({ status: true, creator: CREATOR, result: proxy });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

app.get("/api/fb3", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(url)}`
    );

    const sd = cacheMedia(req, data.sd, ".mp4");
    const hd = cacheMedia(req, data.hd, ".mp4");

    res.json({ status: true, creator: CREATOR, sd, hd });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

app.get("/api/facebook", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://apis.davidcyril.name.ng/facebook2?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.video, ".mp4");

    res.json({ status: true, creator: CREATOR, result: proxy });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ▶️ PLAY API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAST YOUTUBE SEARCH
// Races yt-search against a second
// source, and caches repeat queries
// so the same song returns instantly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

const searchCache = new Map();
const SEARCH_CACHE_TTL = 20 * 60 * 1000;

function normalizeVideo(v) {
  return {
    title: v.title,
    url: v.url,
    videoId: v.videoId,
    duration: v.duration || v.timestamp,
    views: v.views,
    uploaded: v.uploaded || v.ago,
    thumbnail: v.thumbnail,
    author: { name: v.author?.name }
  };
}

async function searchViaDanzy(query) {
  const { data } = await ax.get(
    `https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(query)}`,
    { timeout: 8000 }
  );
  const v = data?.result?.[0];
  if (!data?.status || !v) throw new Error("no result");
  return normalizeVideo(v);
}

async function searchViaRabbit(query) {
  const { data } = await ax.get(
    `https://rabbitapi.nett.to/search/youtube?q=${encodeURIComponent(query)}&limit=1`,
    { timeout: 8000 }
  );
  const v = data?.result?.[0];
  if (!v) throw new Error("no result");
  return normalizeVideo(v);
}

// Direct YouTube scrape — no middleman API at all,
// parses ytInitialData straight off the results page
async function searchViaDirect(query) {
  const { data } = await ax.get("https://www.youtube.com/results", {
    params: { search_query: query },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    timeout: 8000
  });

  const match = data.match(/var ytInitialData = (.*?);<\/script>/s);
  if (!match) throw new Error("parse failed");

  const ytInitialData = JSON.parse(match[1]);
  const contents = ytInitialData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
  if (!contents) throw new Error("no contents");

  const section = contents.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
  if (!section) throw new Error("no section");

  const first = section.find(i => i.videoRenderer && i.videoRenderer.lengthText);
  if (!first) throw new Error("no result");

  const v = first.videoRenderer;

  return {
    title: v.title?.runs?.[0]?.text || "No Title",
    url: `https://youtu.be/${v.videoId}`,
    videoId: v.videoId,
    duration: v.lengthText?.simpleText || null,
    views: v.viewCountText?.simpleText || null,
    uploaded: v.publishedTimeText?.simpleText || null,
    thumbnail: v.thumbnail?.thumbnails?.slice(-1)[0]?.url || null,
    author: { name: null }
  };
}

async function fastYoutubeSearch(query) {
  const key = query.trim().toLowerCase();
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.time < SEARCH_CACHE_TTL) {
    return cached.video;
  }

  const video = await Promise.any([
    searchViaDanzy(query),
    searchViaRabbit(query),
    searchViaDirect(query)
  ]);

  searchCache.set(key, { video, time: Date.now() });
  return video;
}

app.get("/api/play", async (req, res) => {
  noCache(res);
  try {
    const { q, url } = req.query;
    const input = q || url;

    if (!input) return res.status(400).json({
      status: false, creator: CREATOR, message: "Enter song name or YouTube URL"
    });

    let video;

    if (input.includes("youtube.com") || input.includes("youtu.be")) {
      video = { title: "YouTube Audio", url: input, videoId: null, duration: null, views: null, uploaded: null, thumbnail: null, author: { name: null } };
    } else {
      try {
        video = await fastYoutubeSearch(input);
      } catch {
        return res.json({ status: false, creator: CREATOR, message: "No result found" });
      }
    }

    if (!video) return res.json({ status: false, creator: CREATOR, message: "No result found" });

    // Reuse the song backend directly (in-process) — no extra network hop
    let songResult;
    try {
      songResult = await fetchSongDavid(video.url);
    } catch {
      return res.json({ status: false, creator: CREATOR, message: "Audio fetch failed" });
    }

    const proxy = cacheMedia(req, songResult.downloadUrl, ".mp3");

    res.json({
      status: true,
      creator: CREATOR,
      query: input,
      result: {
        title: video.title,
        videoId: video.videoId,
        duration: video.duration,
        views: video.views,
        uploaded: video.uploaded,
        thumbnail: video.thumbnail,
        url: proxy,
        author: { name: video.author?.name }
      }
    });
  } catch (e) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Something went wrong" });
  }
});




// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 For testing 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


app.get("/aud/:id", async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `https://api.sayan-nexuswork.workers.dev/stream?v=${req.params.id}`,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive"
      },
      maxRedirects: 5
    });

    res.status(response.status);

    Object.entries(response.headers).forEach(([key, value]) => {
      if (
        ![
          "content-encoding",
          "transfer-encoding",
          "connection"
        ].includes(key.toLowerCase())
      ) {
        res.setHeader(key, value);
      }
    });

    response.data.pipe(res);

  } catch (err) {
    console.error(err.response?.status, err.response?.data);

    res.status(err.response?.status || 500).json({
      success: false,
      error: err.message,
      status: err.response?.status
    });
  }
});








// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 SONG / YTMP3
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


app.get("/api/song1", async (req, res) => {
noCache(res);

try {
const { url } = req.query;

if (!url) {
  return res.status(400).json({
    success: false,
    creator: CREATOR,
    message: "YouTube URL required"
  });
}

const { data } = await ax.get(
  `https://api.sayan-nexuswork.workers.dev/play?query=${encodeURIComponent(url)}`
);

if (!data?.status || !data?.url) {
  return res.status(404).json({
    success: false,
    creator: CREATOR,
    message: "Song not found"
  });
}

const videoId =
  new URL(data.url).searchParams.get("v");

const proxyUrl =
  `${req.protocol}://${req.get("host")}/audio/${videoId}`;

res.json({
  success: true,
  creator: CREATOR,

  result: {
    title: data.title,
    format: "MP3",

    url: proxyUrl,
    mp3: proxyUrl,
    audio: proxyUrl,
    download: proxyUrl
  }
});

} catch (err) {
res.status(500).json({
success: false,
creator: CREATOR,
error: err.message
});
}
});

app.get("/audio1/:id", async (req, res) => {
try {

const target =
  `https://api.sayan-nexuswork.workers.dev/stream?v=${req.params.id}`;

return res.redirect(target);

} catch (err) {
res.status(500).json({
success: false,
error: err.message
});
}
});



// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SONG BACKEND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━

async function fetchSongDavid(url) {
  const { data } = await ax.get(
    `https://apis.davidcyril.name.ng/download/savetube?url=${encodeURIComponent(url)}&format=mp3`,
    { timeout: 10000 }
  );

  if (!data?.success || !data?.data?.download_url) {
    throw new Error("source unavailable");
  }

  return {
    title: data.data.title,
    duration: data.data.duration,
    quality: data.data.quality,
    thumbnail: data.data.cover,
    downloadUrl: data.data.download_url
  };
}

app.get("/api/song", async (req, res) => {
  noCache(res);

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "YouTube URL required"
      });
    }

    const result = await fetchSongDavid(url);

    const proxy = cacheMedia(req, result.downloadUrl, ".mp3");

    return res.json({
      success: true,
      creator: CREATOR,
      result: {
        title: result.title,
        duration: result.duration,
        quality: result.quality,
        thumbnail: result.thumbnail,
        format: "MP3",
        url: proxy,
        mp3: proxy,
        audio: proxy,
        download: proxy
      }
    });

  } catch (err) {
    return res.status(404).json({
      success: false,
      creator: CREATOR,
      message: "Song not found"
    });
  }
});




app.get("/media/:file", async (req, res) => {
  try {

    const entry = mediaCache.get(req.params.file);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Link expired"
      });
    }

    // Buffer-based entry — serve directly, no upstream fetch needed
    if (Buffer.isBuffer(entry?.buffer)) {
      res.setHeader("Content-Type", entry.contentType || "application/octet-stream");
      res.setHeader("Content-Length", entry.buffer.length);
      return res.end(entry.buffer);
    }

    // URL-based entry — proxy stream from the original source
    const url = entry;

    const response = await ax({
      url,
      method: "GET",
      responseType: "stream"
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "audio/mpeg"
    );

    if (response.headers["content-length"]) {
      res.setHeader(
        "Content-Length",
        response.headers["content-length"]
      );
    }

    response.data.pipe(res);

  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});





    



app.get("/api/ytmp3", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, creator: CREATOR, message: "YouTube URL required" });

    const { data } = await ax.get(
      `https://ytmp333-chama-woad.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&_chm=ofc`
    );

    if (!data?.status || !data?.url) {
return res.status(404).json({
success: false,
creator: CREATOR,
message: "Song not found"
});
    }
    

    res.json({
      success: true,
      creator: CREATOR,
      result: {
        title: data.title,
        
        
        url: data.url,
        mp3: data.url,
        audio: data.url,
        download: data.url
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, creator: CREATOR, error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎥 YOUTUBE DOWNLOADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/ytmp4", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR, message: "YouTube URL is required" });

    const { data } = await ax.get(
      `https://bunny-allsocal-downv2.vercel.app/api/download?url=${encodeURIComponent(url)}`
    );

    const mp4_360  = data.videos.find(v => v.quality.includes("360p")  && v.extension === "mp4") || null;
    const mp4_720  = data.videos.find(v => v.quality.includes("720p")  && v.extension === "mp4") || null;
    const mp4_1080 = data.videos.find(v => v.quality.includes("1080p") && v.extension === "mp4") || null;
    const audio    = data.audios.find(a => a.quality.includes("131kb")) || null;

    const fmt = v => v ? { quality: v.quality, type: v.extension, url: v.url } : null;

    res.json({
      status: true,
      creator: CREATOR,
      metadata: {
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration
      },
      download: {
        video: {
          "360p": fmt(mp4_360),
          "720p": fmt(mp4_720),
          "1080p": fmt(mp4_1080)
        },
        audio: fmt(audio)
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Internal Server Error" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ▶️ YOUTUBE SEARCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/search/youtube", async (req, res) => {
  noCache(res);
  try {
    const { query, q, limit } = req.query;
    const searchQuery = query || q;
    const searchLimit = parseInt(limit) || 10;

    if (!searchQuery) return res.status(400).json({
      status: false, creator: CREATOR, message: "Enter query",
      example: "/search/youtube?q=alan walker&limit=5"
    });

    const { data } = await ax.get(
      `https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(searchQuery)}`,
      { timeout: 15000 }
    );

    if (!data?.status || !Array.isArray(data.result) || !data.result.length) {
      return res.status(404).json({
        status: false,
        creator: CREATOR,
        message: "No results found"
      });
    }

    const videos = data.result.slice(0, searchLimit).map((v, i) => ({
      id: i + 1,
      title: v.title,
      url: v.url,
      videoId: v.videoId,
      duration: v.duration,
      views: v.views,
      uploaded: v.uploaded,
      thumbnail: v.thumbnail,
      author: { name: null, url: null }
    }));

    res.json({
      status: true,
      creator: CREATOR,
      query: searchQuery,
      total: videos.length,
      limit: searchLimit,
      result: videos
    });
  } catch (e) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Search failed" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ IMAGE SEARCH (single route)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function googleScrape(query, limit = 10) {
  const { data } = await ax.get(
    `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
    { timeout: 5000 }
  );
  const $ = cheerio.load(data);
  const results = [];
  $("img").each((_, el) => {
    const img = $(el).attr("src");
    if (img && img.startsWith("http") && !results.includes(img)) results.push(img);
  });
  return results.slice(0, limit);
}

function gisSearch(query, limit = 10) {
  return new Promise((resolve, reject) => {
    gis(query, (err, results) => {
      if (err) return reject(err);
      resolve(results.map(v => v.url).filter(v => v && v.startsWith("http")).slice(0, limit));
    });
  });
}

app.get("/api/image", async (req, res) => {
  noCache(res);
  try {
    const { q, query, limit } = req.query;
    const searchQ = q || query;
    if (!searchQ) return res.status(400).json({ status: false, creator: CREATOR, message: "Query required" });

    let result = [];
    let source = "google-scrape";

    try {
      result = await googleScrape(searchQ, Number(limit) || 10);
      if (!result.length) throw new Error("No results");
    } catch {
      source = "gis-fallback";
      result = await gisSearch(searchQ, Number(limit) || 10);
    }

    res.json({
      status: true,
      creator: CREATOR,
      query: searchQ,
      source,
      total: result.length,
      result
    });
  } catch (e) {
    res.status(500).json({ status: false, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 SPOTIFY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/search/spotify", async (req, res) => {
  noCache(res);
  try {
    const { q, limit } = req.query;
    if (!q) return res.status(400).json({ status: false, creator: CREATOR, message: "Query is required" });

    const { data } = await ax.get(
      `https://jerrycoder.oggyapi.workers.dev/search/spotify?q=${encodeURIComponent(q)}&limit=${limit || 15}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      query: q,
      total: data.tracks?.length || 0,
      result: data.tracks || []
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Internal Server Error" });
  }
});

app.get("/api/spotify", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR, message: "Spotify URL is required" });

    const { data } = await ax.get(
      `https://jerrycoder.oggyapi.workers.dev/down/spotify?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.download_link, ".mp3");

    res.json({
      status: true,
      creator: CREATOR,
      title: data.title,
      artist: data.artist,
      duration: data.duration,
      thumbnail: data.thumbnail,
      url: proxy
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Internal Server Error" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📌 PINTEREST (single /api/pint route)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/search/pinterest", async (req, res) => {
  noCache(res);
  try {
    const { q, type, limit } = req.query;
    if (!q) return res.status(400).json({ status: false, creator: CREATOR, message: "Query is required" });

    const { data } = await ax.get(
      `https://jerrycoder.oggyapi.workers.dev/search/pin?q=${encodeURIComponent(q)}&type=${type || "both"}&limit=${limit || 10}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      query: q,
      type: data.type,
      total: data.total,
      result: data.result
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR });
  }
});

app.get("/api/pinterest", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR, message: "Pinterest URL is required" });

    const { data } = await ax.get(
      `https://jerrycoder.oggyapi.workers.dev/down/pinterest?url=${encodeURIComponent(url)}`
    );

    const proxy = cacheMedia(req, data.url, ".mp4");
    const thumbnail = cacheMedia(req, data.thumbnail, ".jpg");

    res.json({
      status: true,
      creator: CREATOR,
      title: data.title,
      author: data.author,
      thumbnail,
      url: proxy
    });
  } catch (err) {
    res.status(500).json({ status: false, creator: CREATOR, message: "Internal Server Error" });
  }
});

app.get("/api/pint", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://apis.davidcyril.name.ng/download/pinterest?url=${encodeURIComponent(url)}`
    );

    if (!data.success) return res.json({ status: false, creator: CREATOR, error: "Failed to fetch Pinterest media" });

    const medias = data.data.medias || [];
    const video = medias.find(v => v.extension === "mp4") || medias[0];

    const ext = video.extension ? `.${video.extension}` : ".mp4";
    const proxy = cacheMedia(req, video.url, ext);
    const thumbnail = cacheMedia(req, data.data.thumbnail, ".jpg");

    res.json({
      status: true,
      creator: CREATOR,
      title: data.data.title,
      thumbnail,
      quality: video.quality,
      ext: video.extension,
      size: video.formattedSize,
      url: proxy
    });
  } catch (e) {
    res.json({ status: false, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 WEB SCREENSHOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/tool/webss", async (req, res) => {
  noCache(res);
  let stream;
  try {
    let { url, m } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR, message: "URL parameter required" });

    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    m = (m || "desktop").toLowerCase();

    const encodedUrl = encodeURIComponent(url);
    const api = m === "mobile"
      ? `https://jerrycoder.oggyapi.workers.dev/tool/ss?url=${encodedUrl}`
      : `https://jerrycoder.oggyapi.workers.dev/tool/fullss?url=${encodedUrl}`;

    const response = await axios({
      method: "GET",
      url: api,
      responseType: "stream",
      timeout: 30000,
      httpsAgent: ssAgent,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    stream = response.data;

    res.setHeader("Content-Type", response.headers["content-type"] || "image/png");
    res.setHeader("Content-Disposition", "inline");
    noCache(res);

    stream.on("end",   () => safeDestroy(stream));
    stream.on("close", () => safeDestroy(stream));
    stream.on("error", () => safeDestroy(stream));

    req.on("close", () => safeDestroy(stream));
    res.on("finish", () => safeDestroy(stream));

    stream.pipe(res);
  } catch (e) {
    safeDestroy(stream);
    res.status(500).json({ status: false, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ REMOVE BACKGROUND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/removebg", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({
      status: false, creator: CREATOR, message: "Image URL required"
    });

    const response = await ax.get(
      `https://api.danzy.web.id/api/maker/removebg?url=${encodeURIComponent(url)}`,
      { timeout: 60000, responseType: "arraybuffer" }
    );

    const contentType = response.headers["content-type"] || "image/png";
    if (!contentType.startsWith("image")) {
      return res.status(502).json({
        status: false,
        creator: CREATOR,
        message: "Failed to remove background"
      });
    }

    const buffer = Buffer.from(response.data);
    const proxy = cacheBufferMedia(req, buffer, contentType, ".png");

    res.json({
      status: "success",
      creator: CREATOR,
      result: {
        url: proxy
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Failed to remove background"
    });
  }
});

app.post("/api/removebg", upload.single("image"), async (req, res) => {
  noCache(res);
  try {
    if (!req.file) return res.status(400).json({
      status: false, creator: CREATOR, message: "Image file required"
    });

    // Host the uploaded file temporarily on our own domain so the
    // upstream removal API (which only accepts a URL) can fetch it
    const ext = "." + (req.file.originalname?.split(".").pop() || "jpg").toLowerCase();
    const tempUrl = cacheBufferMedia(
      req,
      req.file.buffer,
      req.file.mimetype || "image/jpeg",
      ext,
      5 * 60 * 1000 // short-lived — only needs to survive the upstream fetch
    );

    const response = await ax.get(
      `https://api.danzy.web.id/api/maker/removebg?url=${encodeURIComponent(tempUrl)}`,
      { timeout: 60000, responseType: "arraybuffer" }
    );

    const contentType = response.headers["content-type"] || "image/png";
    if (!contentType.startsWith("image")) {
      return res.status(502).json({
        status: false,
        creator: CREATOR,
        message: "Failed to remove background"
      });
    }

    const buffer = Buffer.from(response.data);
    const proxy = cacheBufferMedia(req, buffer, contentType, ".png");

    res.json({
      status: "success",
      creator: CREATOR,
      result: {
        url: proxy
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Failed to remove background"
    });
  } finally {
    if (req.file) req.file.buffer = null;
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎤 LYRICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/lyrics", async (req, res) => {
  noCache(res);
  try {
    const { song } = req.query;
    if (!song) return res.status(400).json({ status: false, creator: CREATOR });

    const { data } = await ax.get(
      `https://apis.davidcyril.name.ng/lyrics3?song=${encodeURIComponent(song)}`
    );

    res.json({ status: true, creator: CREATOR, result: data.result });
  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 RANDOM LEAK VIDEO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GITHUB_MP4 = "https://raw.githubusercontent.com/xoo59568-art/newapi/refs/heads/main/database/leakvideo.json";

app.get("/api/leak/terabox", async (req, res) => {
  noCache(res);
  let stream;
  try {
    const json = req.query.json === "true";

    const { data } = await ax.get(GITHUB_MP4);

    if (!Array.isArray(data) || data.length === 0) return res.status(404).json({
      success: false, creator: CREATOR, message: "No video links found"
    });

    const random = data[Math.floor(Math.random() * data.length)];

    if (json) return res.json({ success: true, creator: CREATOR, result: { url: random } });

    const response = await axios({ url: random, method: "GET", responseType: "stream", timeout: 60000 });

    stream = response.data;

    res.setHeader("Content-Type", "video/mp4");
    noCache(res);

    stream.on("end",   () => safeDestroy(stream));
    stream.on("close", () => safeDestroy(stream));
    stream.on("error", () => safeDestroy(stream));

    req.on("close",   () => safeDestroy(stream));
    res.on("finish",  () => safeDestroy(stream));

    stream.pipe(res);
  } catch (e) {
    safeDestroy(stream);
    res.status(500).json({ success: false, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ☁️ CDN UPLOAD (file)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post("/cdn/upload", upload.single("file"), async (req, res) => {
  noCache(res);
  try {
    if (!req.file) return res.json({ status: false, creator: CREATOR, message: "No file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const response = await ax.post("https://cdnfile.pages.dev/upload", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    });

    const filename = response.data.url.split("/").pop();
    const base = `${req.protocol}://${req.get("host")}`;

    res.json({
      status: true,
      creator: CREATOR,
      filename,
      url: `${base}/file/${filename}`,
      cdn: `${base}/file/${filename}`
    });
  } catch (e) {
    res.json({ status: false, creator: CREATOR, error: e.message });
  } finally {
    // free buffer from memory immediately
    if (req.file) req.file.buffer = null;
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  noCache(res);
  try {
    if (!req.file) return res.status(400).json({ success: false, code: 400, creator: CREATOR, message: "No file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

    const response = await ax.post("https://ar-hosting.pages.dev/upload", form, {
      headers: { ...form.getHeaders() },
      timeout: 120000,
      maxBodyLength: Infinity
    });

    const filename = response.data.url.split("/").pop();
    const base = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      code: 200,
      creator: "RabbitX CDN",
      result: {
        name: filename,
        size: response.data.size,
        type: response.data.media_type,
        uploaded: response.data.uploaded_on,
        url: `${base}/cdn/${filename}`,
        cdn: `${base}/cdn/${filename}`
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, code: 500, creator: CREATOR, error: e.message });
  } finally {
    if (req.file) req.file.buffer = null;
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 UPLOAD FROM URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/upload/url", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, code: 400, creator: CREATOR, message: "URL parameter required" });

    const response = await ax.get(`https://ar-hosting.pages.dev/hosturl?url=${encodeURIComponent(url)}`);
    const filename = response.data.url.split("/").pop();
    const base = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      code: 200,
      creator: "RabbitX CDN",
      result: {
        name: filename,
        size: response.data.size,
        type: response.data.media_type,
        uploaded: response.data.uploaded_on,
        url: `${base}/cdn/${filename}`,
        cdn: `${base}/cdn/${filename}`
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, code: 500, creator: CREATOR, error: e.message });
  }
});

app.get("/cdn/url", async (req, res) => {
  noCache(res);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, code: 400, creator: CREATOR, message: "URL required" });

    const response = await ax.get(`https://ar-hosting.pages.dev/hosturl?url=${encodeURIComponent(url)}`);
    const filename = response.data.url.split("/").pop();
    const base = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      code: 200,
      creator: "RabbitX CDN",
      result: {
        name: filename,
        size: response.data.size,
        type: response.data.media_type,
        uploaded: response.data.uploaded_on,
        cdn: `${base}/cdn/${filename}`
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, code: 500, creator: CREATOR, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📂 CDN FILE PROXY (/file/:file)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/file/:file", async (req, res) => {
  noCache(res);
  let stream;
  try {
    const target = `https://cdnfile.pages.dev/${req.params.file}`;
    const response = await axios({ url: target, method: "GET", responseType: "stream", timeout: 30000 });

    stream = response.data;

    if (response.headers["content-type"])   res.setHeader("Content-Type",   response.headers["content-type"]);
    if (response.headers["content-length"]) res.setHeader("Content-Length", response.headers["content-length"]);

    res.setHeader("Accept-Ranges",  "bytes");
    res.setHeader("x-rabbit-cdn",   "RabbitX Edge");
    noCache(res);

    stream.on("end",   () => safeDestroy(stream));
    stream.on("close", () => safeDestroy(stream));
    stream.on("error", () => safeDestroy(stream));
    req.on("close",    () => safeDestroy(stream));
    res.on("finish",   () => safeDestroy(stream));

    stream.pipe(res);
  } catch (e) {
    safeDestroy(stream);
    res.status(404).json({ status: false, creator: CREATOR, message: "File not found" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📂 CDN FILE PROXY (/cdn/:file)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/cdn/:file", async (req, res) => {
  noCache(res);
  let stream;
  try {
    const target = `https://ar-hosting.pages.dev/${req.params.file}`;
    const response = await axios({ url: target, method: "GET", responseType: "stream", timeout: 30000, headers: { "User-Agent": "RabbitX-CDN" } });

    stream = response.data;

    if (response.headers["content-type"])   res.setHeader("Content-Type",   response.headers["content-type"]);
    if (response.headers["content-length"]) res.setHeader("Content-Length", response.headers["content-length"]);

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("x-rabbit-cdn",  "RabbitX Edge");
    res.setHeader("x-cache",       "HIT");
    res.removeHeader("x-powered-by");
    noCache(res);

    stream.on("end",   () => safeDestroy(stream));
    stream.on("close", () => safeDestroy(stream));
    stream.on("error", () => safeDestroy(stream));
    req.on("close",    () => safeDestroy(stream));
    res.on("finish",   () => safeDestroy(stream));

    stream.pipe(res);
  } catch (e) {
    safeDestroy(stream);
    res.status(404).json({ success: false, code: 404, creator: CREATOR, message: "File not found" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔌 SOCKET — CHANNEL REACT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

io.on("connection", (socket) => {

  socket.on("register", () => {
    SERVER_COUNT++;
    const serverName = `server ${SERVER_COUNT}`;
    global.botSockets.set(socket.id, { socket, node: serverName });
    console.log(`${serverName} connected`);
  });

  socket.on("disconnect", () => {
    global.botSockets.delete(socket.id);
    console.log(`socket ${socket.id} disconnected — cleaned`);
  });

});

app.get("/api/channel/react", async (req, res) => {
  noCache(res);
  try {
    const { url, react } = req.query;
    if (!url || !react) return res.json({ status: false });

    const reacts = react.split(",");
    let totalSuccess = 0;
    const nodes = [];

    const promises = [...global.botSockets.values()].map(bot => {
      return new Promise(resolve => {
        bot.socket.emit("channel_react", { url, reacts }, (response) => {
          const success = response?.success || 0;
          totalSuccess += success;
          nodes.push({ node: bot.node, success });
          resolve();
        });
      });
    });

    await Promise.all(promises);

    res.json({ status: totalSuccess > 0, total_success: totalSuccess, nodes, channel: url });
  } catch (e) {
    res.json({ status: false, error: e.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 CONNECTION WARM-UP
// Opens/keeps a socket ready to the
// most frequently used backends so
// real requests don't pay the cold
// TLS handshake cost.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WARM_HOSTS = [
  "https://apis.davidcyril.name.ng",
  "https://jerrycoder.oggyapi.workers.dev",
  "https://api.danzy.web.id",
  "https://ar-hosting.pages.dev"
];

function warmConnections() {
  WARM_HOSTS.forEach(host => {
    ax.get(host, { timeout: 5000 }).catch(() => {});
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  warmConnections();
  // Keep the keep-alive sockets warm every 4 minutes
  setInterval(warmConnections, 4 * 60 * 1000);
});
