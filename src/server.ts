import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { authRegisterV1, authLoginV1 } from './auth';
import { channelJoinV2, channelInviteV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { channelsCreateV2 } from './channels';
import { userProfileV1 } from './users';
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

app.post('/auth/register/v2', (req, res) => {
  // eslint-disable-next-line
  const { email, password, nameFirst, nameLast} = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    return res.json(channelsCreateV2(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v2', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
	console.log('This is token:');
	console.log(token);
	console.log('This is channelId:');
	console.log(channelId);
    return res.json(channelJoinV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v2', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelInviteV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v1', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v1', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelAddownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v1', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    return res.json(channelRemoveownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});


app.post('/auth/login/v2', (req, res) => {
  // eslint-disable-next-line
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
});

app.get('/user/profile/v2', (req, res) => {
  const token = req.query.token as string;
  const uId = Number(req.query.uId) as number;
  res.json(userProfileV1(token, uId));
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
