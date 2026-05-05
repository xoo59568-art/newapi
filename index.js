const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const CREATOR = "Sreejanxmd";

// ✅ Home
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Neuro API Running 🚀",
    creator: CREATOR
  });
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
      `https://api.ootaizumi.web.id/downloader/instagram/v1?url=${encodeURIComponent(url)}`
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
        audio: data.result
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
      `https://apiskeith.top/download/instadl?url=${encodeURIComponent(url)}`
    );

    res.json({
      status: true,
      creator: CREATOR,
      quality: data.quality,
      ext: data.ext,
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





///Fixed printers 

import axios from "axios";

app.get("/api/pinterest", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        error: "Missing Pinterest URL"
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const response = await axios.get(
      `https://api-faa.my.id/faa/pin-down?url=${encodeURIComponent(url)}`,
      { timeout: 10000 }
    );

    const data = response.data?.result;

    if (!data || !data.medias || data.medias.length === 0) {
      return res.status(500).json({
        status: false,
        creator: CREATOR,
        error: "No media found"
      });
    }

    // 🎯 Extract first media
    const media = data.medias[0];

    return res.json({
      status: true,
      creator: CREATOR, // 👈 change this
      baseUrl,
      title: data.title,
      thumbnail: data.thumbnail,
      type: media.type,
      quality: media.quality,
      url: media.url
    });

  } catch (e) {
    console.error(e);

    return res.status(500).json({
      status: false,
      creator: CREATOR,
      error: "Failed to fetch Pinterest media"
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
