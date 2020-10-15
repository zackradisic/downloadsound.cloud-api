import scdl from 'soundcloud-downloader'
import { Request, Response } from 'express'

const downloadTrack = async (req: Request, res: Response) => {
  const { body } = req.body

  console.log(body.url)
  if (!body) {
    res.status(422).json({ err: 'Body is empty ' })
    return
  }
  if (!body.url) {
    res.status(422).json({ err: 'URL is empty' })
    return
  }

  if (!scdl.isValidUrl(body.url)) {
    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' })
    return
  }

  try {
    const trackInfo = await scdl.getInfo(body.url)
    const media = trackInfo.media.transcodings[0]
    res.status(200).json({ url: media.url })
  } catch (err) {
    console.log(err)
    res.status(500)
    res.send({ err: 'Internal server error occurred' })
  }
}

export { downloadTrack }
