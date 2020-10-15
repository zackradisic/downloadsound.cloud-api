import express from 'express'
import { body } from 'express-validator'
import scdl from 'soundcloud-downloader'
import bodyParser from 'body-parser'
import axios from 'axios'

const app = express()

const axiosInstance = axios.create({
  timeout: 1000
})

scdl.setAxiosInstance(axiosInstance)
app.use(bodyParser.json())

app.post('/track', [body('url').not().isEmpty().isURL().trim()], async (req, res) => {
  const _body = req.body
  if (!scdl.isValidUrl(_body.url)) {
    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' })
    return
  }

  try {
    const trackInfo = await scdl.getInfo(_body.url)
    const media = trackInfo.media.transcodings[0]
    res.status(200).json({ url: media.url })
  } catch (err) {
    console.log(err)
    res.status(500)
    res.send({ err: 'Internal server error occurred' })
  }
})

app.post('/playlist', [body('url').not().isEmpty().isURL().trim()], async (req, res) => {
  const _body = req.body

  if (!_body.url.includes('playlist')) {
    res.status(422).json({ err: 'URL is not a playlist' })
    return
  }

  if (!scdl.isValidUrl(_body.url)) {
    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' })
    return
  }

  try {
    const setInfo = await scdl.getSetInfo(_body.url)
    const urls = setInfo.tracks.map(track => track.media.transcodings[0]).map(transcodings => transcodings.url)
    res.status(200).json(urls)
  } catch (err) {
    console.log(err)
    res.status(500)
    res.send({ err: 'Internal server error occurred' })
  }
})

console.log('Server listening on 3000 FUCK')
app.listen(3000)
