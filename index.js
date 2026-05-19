const express = require("express");
const axios = require("axios");
const yts = require("yt-search");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(express.json());

const CREATOR = "𓋜 -𝐑ᴀ፝֟፝֟ʙʙɪᴛ/>𝟑ن𓂃";

// ─────────────────────────────────────────
// 🔧 CORE: Race multiple APIs
// ─────────────────────────────────────────
async function raceAPIs(providers) {
  return new Promise((resolve) => {
    let settled = false;
    let failed = 0;

    providers.forEach(async ({ fn }) => {
      try {
        const result = await fn();
        if (!settled && result != null) {
          settled = true;
          resolve({ result });
        }
      } catch {
        // silent
      } finally {
        failed++;
        if (failed === providers.length && !settled) {
          resolve(null);
        }
      }
    });
  });
}

// ─────────────────────────────────────────
// 📦 PROVIDERS REGISTRY
// ─────────────────────────────────────────
const PROVIDERS = {

  instagram: [
    {
      name: "faa",
      fn: (url) => axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.result || null)
    },
    {
      name: "aswin",
      fn: (url) => axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`)
        .then(r => {
          const d = r.data?.data?.[0];
          return d ? { url: d.url, thumbnail: d.thumbnail } : null;
        })
    }
  ],

  facebook: [
    {
      name: "nayan",
      fn: (url) => axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`)
        .then(r => {
          const d = r.data?.data;
          return d ? { title: d.title, thumbnail: d.thumbnail, sd: d.low, hd: d.high } : null;
        })
    },
    {
      name: "rabbit",
      fn: (url) => axios.get(`https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.hd ? { title: r.data.title, thumbnail: r.data.thumbnail, sd: r.data.sd, hd: r.data.hd } : null)
    },
    {
      name: "keith",
      fn: (url) => axios.get(`https://apiskeith.top/download/fbdown?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.result ? { result: r.data.result } : null)
    },
    {
      name: "david",
      fn: (url) => axios.get(`https://apis.davidcyril.name.ng/facebook2?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.video ? { result: r.data.video } : null)
    }
  ],

  youtube_video: [
    {
      name: "bunny",
      fn: (url) => axios.get(`https://bunny-allsocal-downv2.vercel.app/api/download?url=${encodeURIComponent(url)}`)
        .then(r => {
          const d = r.data;
          if (!d?.videos) return null;
          return {
            title: d.title,
            thumbnail: d.thumbnail,
            duration: d.duration,
            "360p": d.videos.find(v => v.quality.includes("360p") && v.extension === "mp4") || null,
            "720p": d.videos.find(v => v.quality.includes("720p") && v.extension === "mp4") || null,
            "1080p": d.videos.find(v => v.quality.includes("1080p") && v.extension === "mp4") || null,
            audio: d.audios?.find(a => a.quality.includes("131kb")) || d.audios?.[0] || null
          };
        })
    }
  ],

  song: [

  // ⚡ FASTEST
  {
    name: "x",
    fn: async (url, signal) => {
      const r = await axiosInstance.get(
        `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(url)}`,
        {
          signal,
          timeout: 5000
        }
      );

      return r.data?.url || null;
    }
  },

  // ⚡ VERY FAST
  {
    name: "rabbit1",
    fn: async (url, signal) => {
      const r = await axiosInstance.get(
        `https://bunny-mp3-fast.vercel.app/api/mp3?url=${encodeURIComponent(url)}`,
        {
          signal,
          timeout: 5000
        }
      );

      return r.data?.download_url || null;
    }
  },

  // ⚡ FAST
  {
    name: "keith",
    fn: async (url, signal) => {
      const r = await axiosInstance.get(
        `https://apiskeith.top/download/audio?url=${encodeURIComponent(url)}`,
        {
          signal,
          timeout: 6000
        }
      );

      return r.data?.result || null;
    }
  },

  // ⚡ FALLBACK
  {
    name: "faa",
    fn: async (url, signal) => {
      const r = await axiosInstance.get(
        `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`,
        {
          signal,
          timeout: 7000
        }
      );

      return r.data?.result?.mp3 || null;
    }
  },

  // ⚡ LAST FALLBACK
  {
    name: "david",
    fn: async (url, signal) => {
      const r = await axiosInstance.get(
        `https://apis.davidcyril.name.ng/download/savetube?url=${encodeURIComponent(url)}&format=mp3`,
        {
          signal,
          timeout: 8000
        }
      );

      return r.data?.data?.download_url || null;
    }
  }

]
  pinterest: [
    {
      name: "jerry",
      fn: (url) => axios.get(`https://jerrycoder.oggyapi.workers.dev/down/pinterest?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.url ? { title: r.data.title, author: r.data.author, thumbnail: r.data.thumbnail, url: r.data.url } : null)
    },
    {
      name: "david",
      fn: (url) => axios.get(`https://apis.davidcyril.name.ng/download/pinterest?url=${encodeURIComponent(url)}`)
        .then(r => {
          if (!r.data?.success) return null;
          const media = r.data.data?.medias?.find(v => v.extension === "mp4") || r.data.data?.medias?.[0];
          return media ? { title: r.data.data.title, thumbnail: r.data.data.thumbnail, url: media.url } : null;
        })
    }
  ],

  spotify: [
    {
      name: "jerry",
      fn: (url) => axios.get(`https://jerrycoder.oggyapi.workers.dev/down/spotify?url=${encodeURIComponent(url)}`)
        .then(r => r.data?.download_link ? {
          title: r.data.title,
          artist: r.data.artist,
          duration: r.data.duration,
          thumbnail: r.data.thumbnail,
          url: r.data.download_link
        } : null)
    }
  ]

};

// ─────────────────────────────────────────
// 🌐 DETECT PLATFORM FROM URL
// ─────────────────────────────────────────
function detectPlatform(url) {
  if (/instagram\.com/.test(url)) return "instagram";
  if (/facebook\.com|fb\.watch/.test(url)) return "facebook";
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube_video";
  if (/pinterest\.com|pin\.it/.test(url)) return "pinterest";
  if (/spotify\.com/.test(url)) return "spotify";
  return null;
}

// ─────────────────────────────────────────
// 🧩 RESPONSE HELPERS
// ─────────────────────────────────────────
function ok(res, req, data) {
  return res.json({
    status: true,
    creator: CREATOR,
    baseUrl: `${req.protocol}://${req.get("host")}`,
    ...data
  });
}

function fail(res, msg = "Failed") {
  return res.status(500).json({
    status: false,
    creator: CREATOR,
    message: msg
  });
}

// ─────────────────────────────────────────
// 🏠 Home
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ─────────────────────────────────────────
// 📸 /api/insta
// ─────────────────────────────────────────
app.get("/api/insta", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.instagram.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "All Instagram APIs failed");

  const d = race.result;
  return ok(res, req, {
    thumbnail: d.thumbnail || null,
    url: d.url || d
  });
});
// ─────────────────────────────────────────
// 📘 /api/fb
// ─────────────────────────────────────────
app.get("/api/fb", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.facebook.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "All Facebook APIs failed");

  const d = race.result;
  return ok(res, req, {
    title: d.title || null,
    thumbnail: d.thumbnail || null,
    sd: d.sd || null,
    hd: d.hd || null
  });
});

// ─────────────────────────────────────────
// 🎥 /api/ytmp4
// ─────────────────────────────────────────
app.get("/api/ytmp4", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.youtube_video.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "YouTube download failed");

  const d = race.result;
  return ok(res, req, {
    metadata: {
      title: d.title,
      thumbnail: d.thumbnail,
      duration: d.duration
    },
    download: {
      video: {
        "360p": d["360p"] ? { quality: d["360p"].quality, type: d["360p"].extension, url: d["360p"].url } : null,
        "720p": d["720p"] ? { quality: d["720p"].quality, type: d["720p"].extension, url: d["720p"].url } : null,
        "1080p": d["1080p"] ? { quality: d["1080p"].quality, type: d["1080p"].extension, url: d["1080p"].url } : null
      },
      audio: d.audio ? { quality: d.audio.quality, type: d.audio.extension, url: d.audio.url } : null
    }
  });
});

// ─────────────────────────────────────────
// 🎵 /api/song
// ─────────────────────────────────────────
app.get("/api/song", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.song.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "Audio extraction failed");

  return ok(res, req, {
    result: {
      audio: race.result,
      url: race.result,
      song: race.result
    }
  });
});

// ─────────────────────────────────────────
// ▶️ /api/play
// ─────────────────────────────────────────
app.get("/api/play", async (req, res) => {
  const input = req.query.q || req.query.url;
  if (!input) return fail(res, "Query or URL required");

  try {
    let video;

    if (input.includes("youtube.com") || input.includes("youtu.be")) {
      video = { title: "YouTube Audio", url: input, videoId: null, duration: null, views: null, uploaded: null, thumbnail: null, author: { name: null } };
    } else {
      const search = await yts(input);
      video = search.videos[0];
    }

    if (!video) return fail(res, "No result found");

    const race = await raceAPIs(PROVIDERS.song.map(p => ({ fn: () => p.fn(video.url) })));
    if (!race) return fail(res, "Audio fetch failed");

    return ok(res, req, {
      query: input,
      result: {
        title: video.title,
        videoId: video.videoId,
        duration: video.timestamp || video.duration,
        views: video.views,
        uploaded: video.ago || video.uploaded,
        thumbnail: video.thumbnail,
        url: race.result,
        author: { name: video.author?.name }
      }
    });

  } catch (e) {
    return fail(res, e.message);
  }
});

// ─────────────────────────────────────────
// 📌 /api/pinterest
// ─────────────────────────────────────────
app.get("/api/pinterest", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.pinterest.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "Pinterest download failed");

  const d = race.result;
  return ok(res, req, {
    title: d.title || null,
    author: d.author || null,
    thumbnail: d.thumbnail || null,
    url: d.url
  });
});

// ─────────────────────────────────────────
// 🎵 /api/spotify
// ─────────────────────────────────────────
app.get("/api/spotify", async (req, res) => {
  const url = req.query.url;
  if (!url) return fail(res, "URL required");

  const race = await raceAPIs(PROVIDERS.spotify.map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, "Spotify download failed");

  const d = race.result;
  return ok(res, req, {
    title: d.title,
    artist: d.artist,
    duration: d.duration,
    thumbnail: d.thumbnail,
    url: d.url
  });
});

// ─────────────────────────────────────────
// 🔍 /search/youtube
// ─────────────────────────────────────────
app.get("/search/youtube", async (req, res) => {
  const q = req.query.q || req.query.query;
  const limit = parseInt(req.query.limit) || 10;
  if (!q) return fail(res, "Query required");

  try {
    const search = await yts(q);
    const videos = search.videos.slice(0, limit).map((v, i) => ({
      id: i + 1,
      title: v.title,
      url: v.url,
      videoId: v.videoId,
      duration: v.timestamp,
      views: v.views,
      uploaded: v.ago,
      thumbnail: v.thumbnail,
      author: { name: v.author.name, url: v.author.url }
    }));

    return ok(res, req, { query: q, total: videos.length, limit, result: videos });
  } catch (e) {
    return fail(res, e.message);
  }
});

// ─────────────────────────────────────────
// 🎵 /search/spotify
// ─────────────────────────────────────────
app.get("/search/spotify", async (req, res) => {
  const q = req.query.q;
  const limit = req.query.limit || 15;
  if (!q) return fail(res, "Query required");

  try {
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/search/spotify?q=${encodeURIComponent(q)}&limit=${limit}`
    );
    return ok(res, req, { query: q, total: data.tracks?.length || 0, result: data.tracks || [] });
  } catch (e) {
    return fail(res, e.message);
  }
});

// ─────────────────────────────────────────
// 📌 /search/pinterest
// ─────────────────────────────────────────
app.get("/search/pinterest", async (req, res) => {
  const { q, type = "both", limit = 10 } = req.query;
  if (!q) return fail(res, "Query required");

  try {
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/search/pin?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`
    );
    return ok(res, req, { query: q, type: data.type, total: data.total, result: data.result });
  } catch (e) {
    return fail(res, e.message);
  }
});

// ─────────────────────────────────────────
// 🎤 /api/lyrics
// ─────────────────────────────────────────
app.get("/api/lyrics", async (req, res) => {
  const song = req.query.song || req.query.q;
  if (!song) return fail(res, "Song name required");

  try {
    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/lyrics3?song=${encodeURIComponent(song)}`
    );
    return ok(res, req, { result: data.result });
  } catch (e) {
    return fail(res, e.message);
  }
});

// ─────────────────────────────────────────
// 🌍 /api/all — Universal downloader
// ─────────────────────────────────────────
app.get("/api/all", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      message: "URL required",
      supported: ["instagram", "facebook", "youtube", "pinterest", "spotify"]
    });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      message: "Unsupported platform",
      supported: ["instagram", "facebook", "youtube", "pinterest", "spotify"]
    });
  }

  const race = await raceAPIs(PROVIDERS[platform].map(p => ({ fn: () => p.fn(url) })));
  if (!race) return fail(res, `All ${platform} APIs failed`);

  return ok(res, req, { platform, ...race.result });
});

// ─────────────────────────────────────────
// 📋 /api/routes
// ─────────────────────────────────────────
app.get("/api/routes", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json({
    status: true,
    creator: CREATOR,
    baseUrl,
    endpoints: {
      universal: { "/api/all": "Auto-detect platform & download (url=)" },
      downloaders: {
        "/api/insta": "Instagram (url=)",
        "/api/fb": "Facebook (url=)",
        "/api/ytmp4": "YouTube video (url=)",
        "/api/song": "YouTube audio (url=)",
        "/api/play": "Search + audio (q= or url=)",
        "/api/spotify": "Spotify (url=)",
        "/api/pinterest": "Pinterest (url=)"
      },
      search: {
        "/search/youtube": "YouTube search (q=, limit=)",
        "/search/spotify": "Spotify search (q=, limit=)",
        "/search/pinterest": "Pinterest search (q=, type=, limit=)"
      },
      misc: { "/api/lyrics": "Song lyrics (song=)" }
    }
  });
});

// ─────────────────────────────────────────
// 🚀 Start Server
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
  console.log(`📋 Routes list  → http://localhost:${PORT}/api/routes`);
});
