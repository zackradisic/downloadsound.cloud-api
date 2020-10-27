/* eslint-disable import/first */
// @ts-nocheck
import dotenv from 'dotenv'
import * as path from 'path'
if (process.env.PROD) {
  dotenv.config({ path: path.resolve(__dirname, 'secrets', '.env.production') })
} else {
  dotenv.config({ path: path.resolve(__dirname, '../', 'secrets', '.env.development') })
}
import express from 'express'
import { body } from 'express-validator'
import scdl from 'soundcloud-downloader'
import bodyParser from 'body-parser'
import axios from 'axios'
import _Promise from 'bluebird'

const app = express()

const axiosInstance = axios.create({
  timeout: parseInt(process.env.AXIOS_TIMEOUT)
})

scdl.setAxiosInstance(axiosInstance)
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  next()
})

const appendURL = (url: string, ...params: string[]) => {
  const u = new URL(url)
  params.forEach((val, idx) => {
    if (idx % 2 === 0) u.searchParams.append(val, params[idx + 1])
  })
  return u.href
}

interface PlaylistTrack {
  title: string,
  url: string,
  hls: boolean
}

const getMediaURL = async (url: string, clientID: string): Promise<string> => {
  const res = await axiosInstance.get(appendURL(url, 'client_id', clientID), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    withCredentials: true
  })
  if (!res.data.url) throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${url}`)
  return res.data.url
}

const getMediaURLMany = async (clientID: string, tracks: PlaylistTrack[], concurrency = 15) => {
  return _Promise.map(tracks, async (track: PlaylistTrack) => {
    const url = await getMediaURL(track.url, clientID)
    return { title: track.title, url, hls: track.hls }
  }, { concurrency })
}

const getImgURL = (url: string) => {
  if (!url) return false
  return url.slice(0, url.lastIndexOf('-')).concat('-t500x500.jpg')
}

app.post('/track', [body('url').not().isEmpty().isURL().trim()], async (req, res) => {
  const _body = req.body
  if (!scdl.isValidUrl(_body.url)) {
    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' })
    return
  }

  try {
    const trackInfo = await scdl.getInfo(_body.url)
    const media = trackInfo.media.transcodings[0]
    const mediaURL = await getMediaURL(media.url, scdl._clientID)
    res.status(200).json({ url: mediaURL, title: trackInfo.title, author: trackInfo.user, imageURL: getImgURL(trackInfo.artwork_url) || getImgURL(trackInfo.user.avatar_url) })
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      res.status(408)
      return
    }
    res.status(500)
    res.send({ err: 'Internal server error occurred' })
  }
})

app.post('/playlist', [body('url').not().isEmpty().isURL().trim()], async (req, res) => {
  const _body = req.body

  if (!(_body.url.includes('playlist') || _body.url.includes('sets'))) {
    res.status(422).json({ err: 'URL is not a playlist' })
    return
  }

  if (!scdl.isValidUrl(_body.url)) {
    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' })
    return
  }

  try {
    const setInfo = await scdl.getSetInfo(_body.url)
    if (setInfo.tracks.length > 100) {
      res.status(403).send({ err: 'That playlist has too many tracks', count: setInfo.tracks.length })
      return
    }
    const urls = setInfo.tracks.map(track => (
      {
        title: track.title,
        url: track.media.transcodings[0].url,
        hls: !track.media.transcodings[0].url.includes('progressive')
      }
    ))
    const mediaURLS = await getMediaURLMany(scdl._clientID, urls)
    res.status(200).json({ url: _body.url, title: setInfo.title, tracks: mediaURLS, author: setInfo.user, imageURL: getImgURL(setInfo.artwork_url) || getImgURL(setInfo.user.avatar_url) })
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      res.status(408)
      return
    }
    console.log(err)
    res.status(500)
    res.send({ err: 'Internal server error occurred' })
  }
})

const port = process.env.port || 8080
console.log('Server listening on: ' + port)
app.listen(port)
