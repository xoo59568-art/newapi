const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const CREATOR = "Sreejanxmd";

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
// 🎵 Song
// =======================
app.get("/api/song", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, creator: CREATOR });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apiskeith.top/download/audio?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      result: {
        audio: data.result,
        url: data.result,
        song: data.result,
      }
    });

  } catch {
    res.json({ status: false, creator: CREATOR });
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
// 🎤 ytmp4
// =======================

app.get("/api/ytmp4", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, creator: CREATOR });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { data } = await axios.get(
      `https://apiskeith.top/download/dlmp4?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl,
      url: data.result || data
    });

  } catch (e) {
    res.json({
      status: false,
      creator: CREATOR,
      error: e.message
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
app.get("/down/spotify", async (req, res) => {
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



//Pinterest 
app.get("/api/pinterest", async (req, res) => {
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
