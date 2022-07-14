import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import {channelMessagesV1} from './dm.ts'
import {MessagesLength} from './dm.ts'

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v2', (req, res, next) => {
  try {
    const token = req.query.token;
    const channelId = req.query.channelId;
    const start = req.query.start;

    const length = MessagesLength(channelId);
    
    const functionTimes = (length - start)/2;

    return res.json(channelMessagesV2(token, channelId, start));
  }

  catch (err) {
    next(err);
  }
});



// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
