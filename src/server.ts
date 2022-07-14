import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { channelsCreateV2 } from './channels';
import { channelDetailsV2 } from './channel';

// delete
import { clearV1 } from './other';

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

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV2(token as string, parseInt(channelId as string)));
});

app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV2(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

// dummy functions to be deleted

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

function authRegisterV2 (email, password) {
  return {
    token: 'tokenstring',
    authUserId: 12345
  };
}

app.post('/auth/register/v2', (req, res) => {
  const { email, password } = req.body;
  res.json(authRegisterV2('tokenstring', 123));
});

//

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
