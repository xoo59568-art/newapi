const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const CREATOR = "Sreejanxmd";

// 🔥 Home route
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Neuro API Running 🚀",
    creator: CREATOR
  });
});


// =======================
// 📸 Instagram Downloader
// =======================
app.get("/api/instagram", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Instagram URL required",
        creator: CREATOR
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const response = await axios.get(
      `https://api.ootaizumi.web.id/downloader/instagram/v1?url=${encodeURIComponent(url)}`
    );

    const data = response.data;

    res.json({
      status: true,
      statusCode: 200,
      creator: CREATOR,
      baseUrl: baseUrl,
      result: data.result
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch Instagram data",
      creator: CREATOR
    });
  }
});


// =======================
// 📘 Facebook Downloader
// =======================
app.get("/api/facebook", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Facebook URL required",
        creator: CREATOR
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const response = await axios.get(
      `https://apis.davidcyril.name.ng/facebook2?url=${encodeURIComponent(url)}`
    );

    const data = response.data;

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl: baseUrl,
      result: data.video
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch Facebook video",
      creator: CREATOR
    });
  }
});


// =======================
// 🎵 Song Downloader
// =======================
app.get("/api/song", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "YouTube URL required",
        creator: CREATOR
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const response = await axios.get(
      `https://apiskeith.top/download/audio?url=${encodeURIComponent(url)}`
    );

    const data = response.data;

    res.json({
      status: true,
      creator: CREATOR,
      baseUrl: baseUrl,
      result: {
        audio: data.result
      }
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch audio",
      creator: CREATOR
    });
  }
});


// =======================
// 🚀 Start Server
// =======================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
