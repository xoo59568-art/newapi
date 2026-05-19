const express = require("express");
const yts = require("yt-search");
const axios = require("axios");
const cheerio = require("cheerio");
const gis = require("g-i-s");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const CREATOR = "𓋜 -𝐑ᴀ፝֟፝֟ʙʙɪᴛ/>𝟑ن𓂃";

// ✅ Home
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      title: data.data.title,
      thumbnail: data.data.thumbnail,
  sd: data.data.low,
  hd: data.data.high
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
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
      title: data.title,
      thumbnail: data.thumbnail,
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
        status: false,
        creator: CREATOR,
        message: "YouTube URL required"
      });
    }

    // Get download URL from upstream API
    const { data } = await axios.get(
      `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(url)}`,
      {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    // Validate
    if (!data?.status || !data?.data?.url) {
      return res.status(404).json({
        status: false,
        creator: CREATOR,
        message: "Song not found"
      });
    }

    const songUrl = data.data.url;
    const title = data.data.title || "song";

    // Stream MP3
    const stream = await axios({
      url: songUrl,
      method: "GET",
      responseType: "stream",
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://youtube.com/"
      }
    });

    // Headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${title}.mp3"`
    );

    // Pipe stream
    stream.data.pipe(res);

  } catch (err) {
    console.log("[SONG API ERROR]", err.message);

    res.status(500).json({
      status: false,
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


// 🚀 Start
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
