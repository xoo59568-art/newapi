const express = require('express')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'API Running Successfully',
    creator: 'sreejanxd'
  })
})

app.get('/download/audio', async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Please provide a YouTube URL',
        creator: 'YourName'
      })
    }

    const response = await axios.get(
      `https://apiskeith.top/download/audio?url=${encodeURIComponent(url)}`
    )

    const data = response.data

    return res.json({
      status: data.status,
      creator: 'sreejanxd',
      link: data.result
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      status: false,
      message: 'Failed to fetch audio',
      creator: 'sreejanxd'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
