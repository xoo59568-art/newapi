const express = require("express");
const yts = require("yt-search");
const axios = require("axios");
const cheerio = require("cheerio");
const gis = require("g-i-s");
const multer = require("multer");
const FormData = require("form-data");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
const upload = multer({
  storage: multer.memoryStorage()
});

const CREATOR = "𓋜 -𝐑ᴀ፝֟፝֟ʙʙɪᴛ/>𝟑ن𓂃";

// ✅ Home
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// ☁️ Upload Page
app.get("/upload", (req, res) => {
  res.sendFile(__dirname + "/upload.html");
});
// ☁️ Upload Page
app.get("/category/downloader", (req, res) => {
  res.sendFile(__dirname + "/category/downloader.html");
});

// =======================
// 📸 Instagram
// =======================

app.get("/api/instagram", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      url: data.result
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

// =======================
// 📸 Instagram
// =======================
app.get("/api/insta", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      thumbnail: data.data[0].thumbnail,
      url: data.data[0].url
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});



//Faceb

app.get("/api/fb", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Facebook URL required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(url)}`,
      {
        timeout: 120000
      }
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      title: data?.data?.title || null,
      thumbnail: data?.data?.thumbnail || null,
      hd: data?.data?.high || null,
      sd: data?.data?.low || null
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: err.message || "Internal Server Error"
    });
  }
});


//fb3

app.get("/api/fb3", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      sd: data.sd,
      hd: data.hd
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});


//Facebook2

app.get("/api/fb2", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apiskeith.top/download/fbdown?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      result: data.result
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

// =======================
// 📘 Facebook
// =======================
app.get("/api/facebook", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/facebook2?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      result: data.video
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});



      
// =======================
// ▶️ Play API
// =======================


  
    // =======================
// ▶️ Play API
// =======================

app.get("/api/play", async (req, res) => {

  try {

    const { q, url } = req.query;

    const input = q || url;

    if (!input) {

      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Enter song name or YouTube URL"
      });

    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let video;

    // =======================
    // IF YOUTUBE URL
    // =======================

    if (
      input.includes("youtube.com") ||
      input.includes("youtu.be")
    ) {

      video = {
        title: "YouTube Audio",
        url: input,
        videoId: null,
        duration: null,
        views: null,
        uploaded: null,
        thumbnail: null,
        author: {
          name: null
        }
      };

    } else {

      // =======================
      // SEARCH VIDEO
      // =======================

      const searchRes = await axios.get(
        `https://rabbitapi.nett.to/search/youtube?q=${encodeURIComponent(input)}&limit=1`
      );

      video = searchRes.data.result[0];

    }

    if (!video) {

      return res.json({
        status: false,
        creator: CREATOR,
        message: "No result found"
      });

    }

    // =======================
    // AUDIO API
    // =======================

    const audioRes = await axios.get(
      `https://rabbitapi.nett.to/api/song?url=${encodeURIComponent(video.url)}`
    );

    const audioUrl =
      audioRes?.data?.payload?.result?.audio ||
      audioRes?.data?.result?.audio ||
      audioRes?.data?.result ||
      null;

    if (!audioUrl) {

      return res.json({
        status: false,
        creator: CREATOR,
        message: "Audio fetch failed"
      });

    }

    // =======================
    // RESPONSE
    // =======================

    res.json({

      status: true,

      creator: CREATOR,

      baseUrl,

      query: input,

      result: {

        title: video.title,

        videoId: video.videoId,

        duration: video.duration,

        views: video.views,

        uploaded: video.uploaded,

        thumbnail: video.thumbnail,

        url: audioUrl,

        author: {
          name: video.author?.name
        }

      }

    });

  } catch (e) {

    res.status(500).json({

      status: false,

      creator: CREATOR,

      error: e.message

    });

  }

});


app.get("/api/song", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        creator: CREATOR,
        message: "YouTube URL required"
      });
    }

    // API Request
    const api = `https://ytmp333-chama-woad.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&_chm=ofc`;

    const { data } = await axios.get(api, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // Check response
    if (!data || !data.success || !data.download) {
      return res.status(404).json({
        success: false,
        creator: CREATOR,
        message: "Song not found"
      });
    }

    // Normal clean response
    res.json({
      success: true,
      creator: CREATOR,
      result: {
        title: data.title,
        format: data.format,
        quality: data.quality,
        url: data.download,
        mp3: data.download,
        audio: data.download,
        download: data.download
      }
    });

  } catch (err) {
    console.log("[SONG API ERROR]", err.message);

    res.status(500).json({
      success: false,
      creator: CREATOR,
      error: err.message
    });
  }
});

// =======================
// 🖼️ Image Search
// =======================
app.get("/api/image", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apiskeith.top/search/images?query=${encodeURIComponent(query)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      total: data.result.length,
      result: data.result
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});


// =======================
// 🎥 YouTube Downloader
// =======================
app.get("/api/ytmp4", async (req, res) => {
  try {
    const { url } = req.query;

    // url check
    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "YouTube URL is required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // fetch api
    const { data } = await axios.get(
      `https://bunny-allsocal-downv2.vercel.app/api/download?url=${encodeURIComponent(url)}`
    );

    // best video qualities
    const mp4_360 =
      data.videos.find(v => v.quality.includes("360p") && v.extension === "mp4");

    const mp4_720 =
      data.videos.find(v => v.quality.includes("720p") && v.extension === "mp4");

    const mp4_1080 =
      data.videos.find(v => v.quality.includes("1080p") && v.extension === "mp4");

    // best audio
    const audio =
      data.audios.find(a => a.quality.includes("131kb"));

    // styled response
    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,

      metadata: {
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration
      },

      download: {
        video: {
          "360p": mp4_360
            ? {
                quality: mp4_360.quality,
                type: mp4_360.extension,
                url: mp4_360.url
              }
            : null,

          "720p": mp4_720
            ? {
                quality: mp4_720.quality,
                type: mp4_720.extension,
                url: mp4_720.url
              }
            : null,

          "1080p": mp4_1080
            ? {
                quality: mp4_1080.quality,
                type: mp4_1080.extension,
                url: mp4_1080.url
              }
            : null
        },

        audio: audio
          ? {
              quality: audio.quality,
              type: audio.extension,
              url: audio.url
            }
          : null
      }
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Internal Server Error"
    });
  }
});

//Instagram 2

app.get("/api/insta2", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, creator: CREATOR });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      quality: data.quality,
      ext: data.ext,
      baseUrl,
      thumbnail: data.data[0].thumbnail,
      url: data.data[0].url
    });

  } catch (e) {
    res.json({
      status: false,
      creator: CREATOR,
      error: e.message
    });
  }
});

// =======================
// =======================
// 🎵 Spotify Search
// =======================
app.get("/search/spotify", async (req, res) => {
  try {
    const { q, limit } = req.query;

    // query check
    if (!q) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Query is required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // fetch spotify search
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/search/spotify?q=${encodeURIComponent(q)}&limit=${limit || 15}`
    );

    // response
    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      query: q,
      total: data.tracks?.length || 0,
      result: data.tracks || []
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Internal Server Error"
    });
  }
});



// =======================
// 🎵 Spotify Download
// =======================
app.get("/api/spotify", async (req, res) => {
  try {
    const { url } = req.query;

    // url check
    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Spotify URL is required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // fetch spotify download
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/down/spotify?url=${encodeURIComponent(url)}`
    );

    // response
    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      title: data.title,
      artist: data.artist,
      duration: data.duration,
      thumbnail: data.thumbnail,
      url: data.download_link
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Internal Server Error"
    });
  }
});




// =======================
// 📌 Pinterest Search
// =======================
app.get("/search/pinterest", async (req, res) => {
  try {
    const { q, type, limit } = req.query;

    // query check
    if (!q) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Query is required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // default values
    const searchType = type || "both";
    const searchLimit = limit || 10;

    // fetch pinterest search
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/search/pin?q=${encodeURIComponent(q)}&type=${searchType}&limit=${searchLimit}`
    );

    // response
    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      query: q,
      type: data.type,
      total: data.total,
      result: data.result
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR
    });
  }
});


// =======================
// 🎵 Pinterest Download 
// =======================
app.get("/api/pinterest", async (req, res) => {
  try {
    const { url } = req.query;

    // url check
    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Pinterest URL is required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // fetch spotify download
    const { data } = await axios.get(
      `https://jerrycoder.oggyapi.workers.dev/down/pinterest?url=${encodeURIComponent(url)}`
    );

    // response
    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      title: data.title,
      author: data.author,
      thumbnail: data.thumbnail,
      url: data.url
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      creator: CREATOR,
      message: "Internal Server Error"
    });
  }
});


//Pinterest 
app.get("/api/pint", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.json({
        status: false,
        creator: CREATOR
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/download/pinterest?url=${encodeURIComponent(url)}`
    );

    if (!data.success) {
      return res.json({
        status: false,
        creator: CREATOR,
        error: "Failed to fetch Pinterest media"
      });
    }

    const medias = data.data.medias || [];

    // mp4 media select
    const video =
      medias.find(v => v.extension === "mp4") || medias[0];

    res.json({
      status: true,
      creator: CREATOR,
      title: data.data.title,
      thumbnail: data.data.thumbnail,
      quality: video.quality,
      ext: video.extension,
      size: video.formattedSize,
      baseUrl,
      url: video.url
    });

  } catch (e) {
    res.json({
      status: false,
      creator: CREATOR,
      error: e.message
    });
  }
});



// =======================
// 🖼️ Google Image Search
// =======================

async function googleScrape(query, limit = 10) {

  const { data } = await axios.get(
    `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 5000
    }
  );

  const $ = cheerio.load(data);

  let results = [];

  $("img").each((i, el) => {

    const img = $(el).attr("src");

    if (
      img &&
      img.startsWith("http") &&
      !results.includes(img)
    ) {
      results.push(img);
    }

  });

  return results.slice(0, limit);
}


// fallback
function gisSearch(query, limit = 10) {

  return new Promise((resolve, reject) => {

    gis(query, (err, results) => {

      if (err) return reject(err);

      const data = results
        .map(v => v.url)
        .filter(v => v && v.startsWith("http"))
        .slice(0, limit);

      resolve(data);

    });

  });

}



app.get("/api/image", async (req, res) => {

  try {

    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Query required"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let result = [];
    let source = "google-scrape";

    try {

      // fast method
      result = await googleScrape(
        q,
        Number(limit) || 10
      );

      if (!result.length) {
        throw new Error("No results");
      }

    } catch {

      // fallback
      source = "gis-fallback";

      result = await gisSearch(
        q,
        Number(limit) || 10
      );

    }

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      query: q,
      source,
      total: result.length,
      result
    });

  } catch (e) {

    res.status(500).json({
      status: false,
      creator: CREATOR,
      error: e.message
    });

  }

});






// Fixed Pinterest 


app.get("/api/pint", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, creator: CREATOR });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/download/pinterest?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      quality: data.quality,
      ext: data.ext,
      quality: data.quality,
      
      baseUrl,
      url: data.url || data
    });

  } catch (e) {
    res.json({
      status: false,
      creator: CREATOR,
      error: e.message
    });
  }
});


// =======================
// ▶️ YouTube Search
// =======================

app.get("/search/youtube", async (req, res) => {

  try {

    const {
      query,
      q,
      limit
    } = req.query;

    // support both q= and query=
    const searchQuery = query || q;

    // default limit
    const searchLimit = parseInt(limit) || 10;

    // validation
    if (!searchQuery) {

      return res.status(400).json({
        status: false,
        creator: CREATOR,
        message: "Enter query",
        example: "/search/youtube?q=alan walker&limit=5"
      });

    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // search
    const search = await yts(searchQuery);

    const videos = search.videos
      .slice(0, searchLimit)
      .map((v, i) => ({

        id: i + 1,

        title: v.title,

        url: v.url,

        videoId: v.videoId,

        duration: v.timestamp,

        views: v.views,

        uploaded: v.ago,

        thumbnail: v.thumbnail,

        author: {
          name: v.author.name,
          url: v.author.url
        }

      }));

    // response
    res.json({

      status: true,

      creator: CREATOR,

      baseUrl,

      query: searchQuery,

      total: videos.length,

      limit: searchLimit,

      result: videos

    });

  } catch (e) {

    res.status(500).json({

      status: false,

      creator: CREATOR,

      error: e.message

    });

  }

});



// ======================
// 🎤 Lyrics
// =======================
app.get("/api/lyrics", async (req, res) => {
  try {
    const { song } = req.query;
    if (!song) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/lyrics3?song=${encodeURIComponent(song)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      result: data.result
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
  }
});

//==================================================
const GITHUB_MP4 =
"https://raw.githubusercontent.com/xoo59568-art/newapi/refs/heads/main/database/leakvideo.json";
// =======================
// 🎬 Random MP4 API
// =======================

app.get("/api/leak/terabox", async (req, res) => {

  try {

    const json =
      req.query.json === "true";

    const { data } =
      await axios.get(GITHUB_MP4);

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      return res.status(404).json({

        success: false,

        creator: CREATOR,

        message: "No video links found"

      });

    }

    const random =
      data[
        Math.floor(
          Math.random() * data.length
        )
      ];

    // JSON response
    if (json) {

      return res.json({

        success: true,

        creator: CREATOR,

        result: {
          url: random
        }

      });

    }

    // Video proxy stream
    const response =
      await axios({

        url: random,

        method: "GET",

        responseType: "stream"

      });

    res.setHeader(
      "Content-Type",
      "video/mp4"
    );
res.setHeader(
  "Cache-Control",
  "public, max-age=300"
);
    response.data.pipe(res);

  } catch (e) {

    res.status(500).json({

      success: false,

      creator: CREATOR,

      error: e.message

    });

  }

});


//==================================================

// // =======================
// 🌐 SOCKET CHANNEL REACT
// =======================

io.on("connection", (socket) => {

  socket.on("register", () => {

    SERVER_COUNT++;

    const serverName =
      `server ${SERVER_COUNT}`;

    global.botSockets.set(
      socket.id,
      {
        socket,
        node:
        serverName
      }
    );

    console.log(
      `${serverName} connected`
    );

  });

  socket.on("disconnect", () => {

    global.botSockets.delete(
      socket.id
    );

  });

});

app.get(
  "/api/channel/react",

  async (req, res) => {

    try {

      const {
        url,
        react
      } = req.query;

      if (!url || !react) {

        return res.json({
          status: false
        });

      }

      const reacts =
        react.split(",");

      let totalSuccess = 0;

      let nodes = [];

      const promises =

        [...global.botSockets.values()]
        .map(bot => {

          return new Promise(resolve => {

            bot.socket.emit(

              "channel_react",

              {
                url,
                reacts
              },

              (response) => {

                const success =
                  response?.success || 0;

                totalSuccess +=
                  success;

                nodes.push({

                  node:
                  bot.node,

                  success

                });

                resolve();

              }

            );

          });

        });

      await Promise.all(
        promises
      );

      res.json({

        status:
        totalSuccess > 0,

        total_success:
        totalSuccess,

        nodes,

        channel:
        url

      });

    } catch (e) {

      res.json({

        status: false,

        error:
        e.message

      });

    }

  }
);
      
// ============================================================================================================================================================================================================



// =======================
// ☁️ CDN Upload
// =======================

app.post(
  "/cdn/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.json({
          status: false,
          creator: CREATOR,
          message: "No file uploaded"
        });

      }

      const form = new FormData();

      form.append(
        "file",
        req.file.buffer,
        req.file.originalname
      );

      // hidden upload
      const response = await axios.post(
        "https://cdnfile.pages.dev/upload",
        form,
        {
          headers: form.getHeaders()
        }
      );

      const backendUrl =
        response.data.url;

      const filename =
        backendUrl.split("/").pop();

      res.json({

        status: true,

        creator: CREATOR,

        filename,

        url:
`${req.protocol}://${req.get("host")}/file/${filename}`,
        cdn:
`${req.protocol}://${req.get("host")}/file/${filename}`

      });

    } catch (e) {

      res.json({

        status: false,

        creator: CREATOR,

        error: e.message

      });

    }

  }
);

// =======================
// 📂 CDN File Proxy
// =======================

app.get(
  "/file/:file",
  async (req, res) => {

    try {

      const file =
        req.params.file;

      const target =
`https://cdnfile.pages.dev/${file}`;

      const response = await axios({

        url: target,

        method: "GET",

        responseType: "stream"

      });

      // content type
      if (
        response.headers["content-type"]
      ) {

        res.setHeader(
          "Content-Type",
          response.headers["content-type"]
        );

      }

      // content length
      if (
        response.headers["content-length"]
      ) {

        res.setHeader(
          "Content-Length",
          response.headers["content-length"]
        );

      }

      // cache
      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000"
      );

      // stream support
      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );

      // fake cdn headers
      res.setHeader(
        "x-rabbit-cdn",
        "RabbitX Edge"
      );

      // stream file
      response.data.pipe(res);

    } catch (e) {

      res.status(404).json({

        status: false,

        creator: CREATOR,

        message: "File not found"

      });

    }

  }
);

// =======================
// 🌐 Upload From URL
// Endpoint:
// GET /upload/url?url=
// =======================

app.get(
  "/upload/url",
  async (req, res) => {

    try {

      const { url } = req.query;

      // check url
      if (!url) {

        return res.status(400).json({

          success: false,

          code: 400,

          creator: CREATOR,

          message: "URL parameter required"

        });

      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       HIDDEN BACKEND REQUEST
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const response =
        await axios.get(

`https://ar-hosting.pages.dev/hosturl?url=${encodeURIComponent(url)}`

      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       BACKEND URL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const backendUrl =
        response.data.url;

      // filename
      const filename =
        backendUrl.split("/").pop();

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CUSTOM RESPONSE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.json({

        success: true,

        code: 200,

        creator: "RabbitX CDN",

        result: {

          name: filename,

          size:
          response.data.size,

          type:
          response.data.media_type,

          uploaded:
          response.data.uploaded_on,
url:
`${req.protocol}://${req.get("host")}/cdn/${filename}`,
  
          cdn:
`${req.protocol}://${req.get("host")}/cdn/${filename}`

        }

      });

    } catch (e) {

      console.log(e);

      res.status(500).json({

        success: false,

        code: 500,

        creator: CREATOR,

        error: e.message

      });

    }

  }
);

// =======================
// ☁️ RabbitX CDN Upload
// Endpoint:
// POST /cdn-upload
// =======================

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      // no file
      if (!req.file) {

        return res.status(400).json({

          success: false,

          code: 400,

          creator: CREATOR,

          message: "No file uploaded"

        });

      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CREATE FORM DATA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const form = new FormData();

      form.append(
        "file",
        req.file.buffer,
        {
          filename:
          req.file.originalname,

          contentType:
          req.file.mimetype
        }
      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       HIDDEN BACKEND UPLOAD
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const response =
        await axios.post(

        "https://ar-hosting.pages.dev/upload",

        form,

        {

          headers: {
            ...form.getHeaders()
          },

          timeout: 120000,

          maxBodyLength: Infinity

        }

      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       BACKEND URL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const backendUrl =
        response.data.url;

      // filename
      const filename =
        backendUrl.split("/").pop();

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CUSTOM RESPONSE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.json({

        success: true,

        code: 200,

        creator: "RabbitX CDN",

        result: {

          name: filename,

          size:
          response.data.size,

          type:
          response.data.media_type,

          uploaded:
          response.data.uploaded_on,

          url:
`${req.protocol}://${req.get("host")}/cdn/${filename}`,
            
          cdn:
`${req.protocol}://${req.get("host")}/cdn/${filename}`

        }

      });

    } catch (e) {

      console.log(e);

      res.status(500).json({

        success: false,

        code: 500,

        creator: CREATOR,

        error: e.message

      });

    }

  }
);

// =======================
// 🌐 Host URL Upload
// Endpoint:
// GET /hosturl?url=
// =======================

app.get(
  "/cdn/url",
  async (req, res) => {

    try {

      const { url } = req.query;

      if (!url) {

        return res.status(400).json({

          success: false,

          code: 400,

          creator: CREATOR,

          message: "URL required"

        });

      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       HIDDEN BACKEND REQUEST
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const response =
        await axios.get(

`https://ar-hosting.pages.dev/hosturl?url=${encodeURIComponent(url)}`

      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       BACKEND URL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const backendUrl =
        response.data.url;

      // filename
      const filename =
        backendUrl.split("/").pop();

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CUSTOM RESPONSE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.json({

        success: true,

        code: 200,

        creator: "RabbitX CDN",

        result: {

          name: filename,

          size:
          response.data.size,

          type:
          response.data.media_type,

          uploaded:
          response.data.uploaded_on,

          cdn:
`${req.protocol}://${req.get("host")}/cdn/${filename}`

        }

      });

    } catch (e) {

      console.log(e);

      res.status(500).json({

        success: false,

        code: 500,

        creator: CREATOR,

        error: e.message

      });

    }

  }
);

// =======================
// 📂 RabbitX CDN File
// Endpoint:
// GET /cdn/:file
// =======================

app.get(
  "/cdn/:file",
  async (req, res) => {

    try {

      const file =
        req.params.file;

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       HIDDEN BACKEND FILE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const target =
`https://ar-hosting.pages.dev/${file}`;

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       FETCH FILE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      const response =
        await axios({

        url: target,

        method: "GET",

        responseType: "stream",

        headers: {

          "User-Agent":
          "RabbitX-CDN"

        }

      });

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CONTENT TYPE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (
        response.headers["content-type"]
      ) {

        res.setHeader(
          "Content-Type",
          response.headers["content-type"]
        );

      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CONTENT LENGTH
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (
        response.headers["content-length"]
      ) {

        res.setHeader(
          "Content-Length",
          response.headers["content-length"]
        );

      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       CACHE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000"
      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       STREAM SUPPORT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       FAKE CDN HEADERS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.setHeader(
        "x-rabbit-cdn",
        "RabbitX Edge"
      );

      res.setHeader(
        "x-cache",
        "HIT"
      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       HIDE EXPRESS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      res.removeHeader(
        "x-powered-by"
      );

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
       STREAM FILE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      */

      response.data.pipe(res);

    } catch (e) {

      console.log(e.message);

      res.status(404).json({

        success: false,

        code: 404,

        creator: CREATOR,

        message: "File not found"

      });

    }

  }
);





// 🚀 Start
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
