import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { channelDetailsV3, channelJoinV2, channelInviteV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { authRegisterV1, authLoginV1, authLogoutV2, passwordRequest, passwordReset } from './auth';
import { channelsListallV3, channelsCreateV3, channelsListV3 } from './channels';
import { messageSendV2, messageEditV2, messageRemoveV2, messageSendDmV2, MessageShareV1, MessageSendLaterDMV1 } from './message';
import { userProfileV3, userProfileSetName, userProfileSetEmail, userProfileSetHandle, usersAll } from './users';
import { dmMessagesV2, dmCreateV2, dmListV2, dmRemoveV2, dmDetailsV2, dmLeaveV2 } from './dm';
import { clearV1 } from './other';
import { channelMessagesV2 } from './channel';
import { searchV1 } from './search';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { adminUserRemoveV1 } from './admin';
import { messageSendLaterV1 } from './message';

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

// for logging errors
app.use(morgan('dev'));

app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  return res.json(MessageSendLaterDMV1(token, dmId, message, timeSent));
});

app.post('/message/sendlater/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.get('/search/v1', (req, res, next) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;

  return res.json(searchV1(token, queryStr));
});

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const channelId = Number(req.query.channelId) as number;
    const start = Number(req.query.start) as number;
    return res.json(channelMessagesV2(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', (req, res) => {
  const token = req.header('token');
  const uId = Number(req.query.uId) as number;
  return res.json(userProfileV3(token, uId));
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    return res.json(dmMessagesV2(token, dmId, start));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmDetailsV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { dmId } = req.body;
    return res.json(dmLeaveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

app.get('/channel/details/v3', (req, res) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV3(token, parseInt(channelId)));
});

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(adminUserRemoveV1(token, uId));
});

app.post('/auth/register/v3', (req, res, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    return res.json(authRegisterV1(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', (req, res, next) => {
  try {
    const { email, password } = req.body;
    return res.json(authLoginV1(email, password));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(authLogoutV2(token));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const email = req.body.email;
  res.json(passwordRequest(email));
});

app.post('/auth/passwordreset/reset/v1', (req, res, next) => {
  try {
    const { resetCode, newPassword } = req.body;
    return res.json(passwordReset(resetCode, newPassword));
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    const { name, isPublic } = req.body;
    return res.json(channelsCreateV3(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(channelsListV3(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token');
  res.json(channelsListallV3(token));
});

app.post('/channel/join/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    return res.json(channelJoinV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelInviteV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId } = req.body;
    return res.json(channelLeaveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelAddownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelRemoveownerV1(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req, res) => {
  res.json(usersAll());
});

app.put('/user/profile/setname/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { nameFirst, nameLast } = req.body;
    return res.json(userProfileSetName(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/email/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { email } = req.body;
    return res.json(userProfileSetEmail(token, email));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/handle/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { handleStr } = req.body;
    return res.json(userProfileSetHandle(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req, res) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

app.put('/message/edit/v2', (req, res) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV2(token, messageId));
});

app.post('/message/senddm/v2', (req, res) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
});

app.post('/message/share/v1', (req, res, next) => {
  try {
    const token = req.header('token');
    const { ogMessageId, message, channelId, dmId } = req.body;
    return res.json(MessageShareV1(token, ogMessageId, message, channelId, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const { uIds } = req.body;
    return res.json(dmCreateV2(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    return res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.header('token');
    const dmId = parseInt(req.query.dmId as string);
    return res.json(dmRemoveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req, res) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(standupActiveV1(token, channelId));
});

app.post('/standup/send/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSendV1(token, channelId, message));
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
