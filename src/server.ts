import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { channelsCreateV2 } from './channels';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 } from './message';

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

app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV2(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v1', (req, res) => {
  const { token, channelId, message } = req.body;
  return res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req, res) => {
  const { token, messageId, message } = req.body;
  return res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v1', (req, res) => {
  const { token, messageId } = req.body;
  return res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  return res.json(messageSendDmV1(token, dmId, message));
});

// dummy functions to delete

function authRegisterV2 (email, password) {
  return {
    token: 'tokenstring',
    authUserId: 12345
  }
}

app.post('/auth/register/v2', (req, res) => {
  const { email, password } = req.body;
  res.json(authRegisterV2('tokenstring', 123));
});

// function channelJoinV2(token: string, channelId: number) {

//   return { };
// }

// app.post('/channel/join/v2', (req, res) => {
//   const { token, channelId } = req.body;
//   res.json(channelJoinV2('tokenstring', 999));
// });

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
