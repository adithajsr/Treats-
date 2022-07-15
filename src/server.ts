import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { channelDetailsV2 } from './channel';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelsListallV2, channelsCreateV2, channelsListV2 } from './channels';
import { userProfileV1, userProfileSetName, userProfileSetEmail, userProfileSetHandle, usersAll } from './users';
import { dmCreateV1, dmListV1, dmRemoveV1, dmDetailsV1, dmLeaveV1 } from './dm';
import { clearV1 } from './other';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 } from './message';

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

app.get('/user/profile/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const uId = Number(req.query.uId) as number;


    return res.json(userProfileV1(token, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV2(token as string, parseInt(channelId as string)));
});

app.post('/auth/register/v2', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/auth/login/v2', (req, res) => {
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
});

app.post('/auth/logout/v1', (req, res, next) => {
  try {
    const { token } = req.body;
    return res.json(authLogoutV1(token));
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

app.get('/channels/list/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(channelsListV2(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v2', (req, res) => {
  const token = req.query.token;
  res.json(channelsListallV2(token as string));
});

app.get('/users/all/v1', (req, res) => {
  const token = req.query.token as string;
  res.json(usersAll(token));
});

app.get('/user/profile/v2', (req, res) => {
  const token = req.query.token as string;
  const uId = Number(req.query.uId) as number;
  return res.json(userProfileV1(token, uId));
});

app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userProfileSetName(token, nameFirst, nameLast));
});

app.put('/user/profile/email/v1', (req, res) => {
  const { token, email } = req.body;
  res.json(userProfileSetEmail(token, email));
});

app.put('/user/profile/handle/v1', (req, res) => {
  const { token, handleStr } = req.body;
  res.json(userProfileSetHandle(token, handleStr));
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
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  return res.json(messageSendDmV1(token, dmId, message));
});

app.post('/dm/create/v1', (req, res, next) => {
  try {
    const { token, uIds } = req.body;
    return res.json(dmCreateV1(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    return res.json(dmListV1(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmRemoveV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmDetailsV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v1', (req, res, next) => {
  try {
    const { token, dmId } = req.body;
    return res.json(dmLeaveV1(token, dmId));
  } catch (err) {
    next(err);
  }
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
