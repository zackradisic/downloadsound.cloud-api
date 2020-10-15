import { Express } from 'express'
import { downloadTrack } from './tracks'

const useRoutes = (app: Express) => {
  app.post('/track', downloadTrack)
}

export default useRoutes
