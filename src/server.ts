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
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
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


import { getData, setData } from './dataStore';

interface dmMember {
  uId: number,
  dmPerms: number,
}


const findTokenIndex = (token: string) => {
  const data = getData();
  const tokenIndex = data.token.findIndex(a => a.token === token);
  return tokenIndex;
};

const areUIdsValidDMCreate = (uIds: number[], creatoruId: number) => {
  const data = getData();

  // Any uId does not refer to a valid user
  for (const uId of uIds) {
    if (data.user.find(a => a.uId === uId) === undefined) {
      // Invalid uId
      return false;
    } else if (uId === creatoruId) {
      // uIds should not include the creator
      return false;
    }
  }

  return true;
};

const createMembersListDMCreate = (uIds: number[], creatoruId: number) => {
  // Create an array to make the members list
  const dmMembers = [];

  // The creator is the owner of the DM
  dmMembers.push({
    uId: creatoruId,
    dmPerms: 1,
  });

  // Other users in the DM have member permissions
  for (const uId of uIds) {
    dmMembers.push({
      uId: uId,
      dmPerms: 2,
    });
  }

  return dmMembers;
};
const createNameDMCreate = (dmMembers: dmMember[]) => {
  const data = getData();

  // Obtain the user handles and alphabetically sort them
  const userIndexes = dmMembers.map((dmMember) => data.user.findIndex(a => a.uId === dmMember.uId));
  const handles: string[] = userIndexes.map((userIndex) => data.user[userIndex].handle);
  handles.sort((a, b) => a.localeCompare(b));

  // Generate the DM name
  let dmName = '';
  for (const handle of handles) {
    dmName += handle + String(', ');
  }
  dmName += -String(', ');

  return dmName;
};


function dmCreateV1(token: string, uIds: number[]) {
  const data = getData();
  const tokenIndex = findTokenIndex(token);

  // Invalid token
  if (tokenIndex === -1) {
    return { error: 'error' };
  }

  const creatoruId = data.token[tokenIndex].uId;

  if (areUIdsValidDMCreate(uIds, creatoruId) === false) {
    return { error: 'error' };
  }

  const newDMId = data.dm.length + 1;
  const dmMembers = createMembersListDMCreate(uIds, creatoruId);
  const dmName = createNameDMCreate(dmMembers);

  // Create a new DM
  data.dm.push({
    dmId: newDMId,
    name: dmName,
    members: dmMembers,
    messages: [],
  });

  setData(data);

  return {
    dmId: newDMId,
  };
}

app.post('/dm/create/v1', (req, res, next) => {
  try {
    const { token, uIds } = req.body;
    return res.json(dmCreateV1(token, uIds));
  } catch (err) {
    next(err);
  }
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
