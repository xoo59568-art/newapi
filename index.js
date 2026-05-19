const express = require("express");
const axios = require("axios");
const yts = require("yt-search");

const http = require("http");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(express.json());

const CREATOR = "𓋜 -𝐑ᴀ፝֟፝֟ʙʙɪᴛ/>𝟑ن𓂃";

// ─────────────────────────────────────────
// ⚡ ULTRA FAST AXIOS
// ─────────────────────────────────────────
const axiosInstance = axios.create({
  timeout: 50000,

  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: 100
  }),

  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: 100
  }),

  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

// ─────────────────────────────────────────
// ⚡ SUPER FAST RACE SYSTEM
// ─────────────────────────────────────────
async function raceAPIs(providers, url) {
  const controller = new AbortController();

  const requests = providers.map(async (provider) => {
    try {
      const result = await provider.fn(url, controller.signal);

      if (result) {
        controller.abort();
        return result;
      }

      throw new Error("No Result");
    } catch {
      throw new Error("Failed");
    }
  });

  try {
    return await Promise.any(requests);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────
// 📦 PROVIDERS
// ─────────────────────────────────────────
const PROVIDERS = {

  // ───────── Instagram
  instagram: [

    {
      name: "aswin",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 5000
          }
        );

        const d = r.data?.data?.[0];

        return d
          ? {
              url: d.url,
              thumbnail: d.thumbnail
            }
          : null;
      }
    },

    {
      name: "faa",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 7000
          }
        );

        return r.data?.result || null;
      }
    }

  ],

  // ───────── Facebook
  facebook: [

    {
      name: "rabbit",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 5000
          }
        );

        return r.data?.hd
          ? {
              title: r.data.title,
              thumbnail: r.data.thumbnail,
              sd: r.data.sd,
              hd: r.data.hd
            }
          : null;
      }
    },

    {
      name: "nayan",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 6000
          }
        );

        const d = r.data?.data;

        return d
          ? {
              title: d.title,
              thumbnail: d.thumbnail,
              sd: d.low,
              hd: d.high
            }
          : null;
      }
    }

  ],

  // ───────── YouTube Video
  youtube_video: [

    {
      name: "bunny",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://bunny-allsocal-downv2.vercel.app/api/download?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 7000
          }
        );

        const d = r.data;

        if (!d?.videos) return null;

        return {
          title: d.title,
          thumbnail: d.thumbnail,
          duration: d.duration,

          "360p":
            d.videos.find(
              v =>
                v.quality.includes("360p") &&
                v.extension === "mp4"
            ) || null,

          "720p":
            d.videos.find(
              v =>
                v.quality.includes("720p") &&
                v.extension === "mp4"
            ) || null,

          "1080p":
            d.videos.find(
              v =>
                v.quality.includes("1080p") &&
                v.extension === "mp4"
            ) || null,

          audio:
            d.audios?.find(a =>
              a.quality.includes("131kb")
            ) || d.audios?.[0] || null
        };
      }
    }

  ],

  // ───────── Song
  song: [

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

  ],

  // ───────── Pinterest
  pinterest: [

    {
      name: "jerry",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://jerrycoder.oggyapi.workers.dev/down/pinterest?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 5000
          }
        );

        return r.data?.url
          ? {
              title: r.data.title,
              author: r.data.author,
              thumbnail: r.data.thumbnail,
              url: r.data.url
            }
          : null;
      }
    },

    {
      name: "david",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://apis.davidcyril.name.ng/download/pinterest?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 7000
          }
        );

        if (!r.data?.success) return null;

        const media =
          r.data.data?.medias?.find(
            v => v.extension === "mp4"
          ) || r.data.data?.medias?.[0];

        return media
          ? {
              title: r.data.data.title,
              thumbnail: r.data.data.thumbnail,
              url: media.url
            }
          : null;
      }
    }

  ],

  // ───────── Spotify
  spotify: [

    {
      name: "jerry",
      fn: async (url, signal) => {

        const r = await axiosInstance.get(
          `https://jerrycoder.oggyapi.workers.dev/down/spotify?url=${encodeURIComponent(url)}`,
          {
            signal,
            timeout: 6000
          }
        );

        return r.data?.download_link
          ? {
              title: r.data.title,
              artist: r.data.artist,
              duration: r.data.duration,
              thumbnail: r.data.thumbnail,
              url: r.data.download_link
            }
          : null;
      }
    }

  ]

};

// ─────────────────────────────────────────
// 🌐 DETECT PLATFORM
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
// 🧩 HELPERS
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
// 🏠 HOME
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: true,
    creator: CREATOR,
    message: "Ultra Fast Downloader API Running 🚀"
  });
});

// ─────────────────────────────────────────
// 📸 INSTAGRAM
// ─────────────────────────────────────────
app.get("/api/insta", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.instagram,
    url
  );

  if (!result) {
    return fail(res, "Instagram download failed");
  }

  return ok(res, req, result);

});

// ─────────────────────────────────────────
// 📘 FACEBOOK
// ─────────────────────────────────────────
app.get("/api/fb", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.facebook,
    url
  );

  if (!result) {
    return fail(res, "Facebook download failed");
  }

  return ok(res, req, result);

});

// ─────────────────────────────────────────
// 🎥 YTMP4
// ─────────────────────────────────────────
app.get("/api/ytmp4", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.youtube_video,
    url
  );

  if (!result) {
    return fail(res, "Video download failed");
  }

  return ok(res, req, result);

});

// ─────────────────────────────────────────
// 🎵 SONG
// ─────────────────────────────────────────
app.get("/api/song", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.song,
    url
  );

  if (!result) {
    return fail(res, "Audio extraction failed");
  }

  return ok(res, req, {
    result: {
      audio: result,
      url: result,
      song: result
    }
  });

});

// ─────────────────────────────────────────
// ▶️ PLAY
// ─────────────────────────────────────────
app.get("/api/play", async (req, res) => {

  const input = req.query.q || req.query.url;

  if (!input) {
    return fail(res, "Query required");
  }

  try {

    let video;

    if (
      input.includes("youtube.com") ||
      input.includes("youtu.be")
    ) {

      video = {
        title: "YouTube Audio",
        url: input,
        thumbnail: null,
        author: {
          name: null
        }
      };

    } else {

      const search = await yts(input);
      video = search.videos[0];

    }

    if (!video) {
      return fail(res, "No result found");
    }

    const audio = await raceAPIs(
      PROVIDERS.song,
      video.url
    );

    if (!audio) {
      return fail(res, "Audio fetch failed");
    }

    return ok(res, req, {
      query: input,

      result: {
        title: video.title,
        thumbnail: video.thumbnail,
        url: audio,
        author: {
          name: video.author?.name
        }
      }
    });

  } catch (e) {

    return fail(res, e.message);

  }

});

// ─────────────────────────────────────────
// 📌 PINTEREST
// ─────────────────────────────────────────
app.get("/api/pinterest", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.pinterest,
    url
  );

  if (!result) {
    return fail(res, "Pinterest download failed");
  }

  return ok(res, req, result);

});

// ─────────────────────────────────────────
// 🎵 SPOTIFY
// ─────────────────────────────────────────
app.get("/api/spotify", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const result = await raceAPIs(
    PROVIDERS.spotify,
    url
  );

  if (!result) {
    return fail(res, "Spotify download failed");
  }

  return ok(res, req, result);

});

// ─────────────────────────────────────────
// 🌍 UNIVERSAL
// ─────────────────────────────────────────
app.get("/api/all", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return fail(res, "URL required");
  }

  const platform = detectPlatform(url);

  if (!platform) {
    return fail(res, "Unsupported platform");
  }

  const result = await raceAPIs(
    PROVIDERS[platform],
    url
  );

  if (!result) {
    return fail(res, "Download failed");
  }

  return ok(res, req, {
    platform,
    ...result
  });

});

// ─────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
