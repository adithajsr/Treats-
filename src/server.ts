import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { channelDetailsV3, channelJoinV2, channelInviteV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelsListallV3, channelsCreateV2, channelsListV2 } from './channels';
import { userProfileV1, userProfileSetName, userProfileSetEmail, userProfileSetHandle, usersAll } from './users';
import { dmMessagesV1, dmCreateV1, dmListV1, dmRemoveV1, dmDetailsV1, dmLeaveV1 } from './dm';
import { clearV1 } from './other';
import { messageSendV2, messageEditV2, messageRemoveV2, messageSendDmV2 } from './message';

import { channelMessagesV2 } from './channel';

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

// handles errors nicely
app.use(errorHandler());

// for logging errors
app.use(morgan('dev'));

app.get('/channel/messages/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const channelId = Number(req.query.channelId) as number;
    const start = Number(req.query.start) as number;
    return res.json(channelMessagesV2(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v2', (req, res) => {
  const token = req.query.token as string;
  const uId = Number(req.query.uId) as number;
  return res.json(userProfileV1(token, uId));
});

app.get('/dm/messages/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    return res.json(dmMessagesV1(token, dmId, start));
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

app.get('/channel/details/v3', (req, res) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV3(token as string, parseInt(channelId as string)));
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
  res.json(channelsListallV3(token as string));
});

app.post('/channel/join/v2', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
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

app.post('/message/send/v2', (req, res) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

app.put('/message/edit/v2', (req, res) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV2(token, messageId));
});

app.post('/message/senddm/v2', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
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

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
