import request from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestClear, requestUserProfile } from './users.test';

const OK = 200;
const url = config.url;
const port = config.port;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      json: { name, isPublic },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

function requestChannelsListAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v3`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestChannelInvite(InviterAUI: string, channelId: number, InviteeAUI: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: { channelId, InviteeAUI },
      headers: { InviterAUI },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

afterEach(() => {
  requestClear();
});

test('Clearing users', () => {
  // Creating a user
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;
  // Clearing and testing
  const object = requestClear();
  expect(object.res.statusCode).toBe(OK);
  expect(requestUserProfile(danielToken, danielId).res.statusCode).toBe(403);
});

test('Clearing channels containing users', () => {
  // Creating a user and obtaining their token and Id
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  // Creating channel then clearing
  requestChannelsCreate(danielToken, 'danielChannel', true);
  const object = requestClear();
  expect(object.res.statusCode).toBe(OK);

  expect(requestUserProfile(danielToken, danielId).res.statusCode).toBe(403);
  const danielToken2 = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  expect(requestChannelsListAll(danielToken2).bodyObj.channels).toMatchObject([]);
});

test('Clearing channels containing multiple users', () => {
  // Creating two users and obtaining their tokens and Ids
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]);

  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;

  // Creating two channels
  const danielChannel = requestChannelsCreate(danielId, 'danielChannel', true).bodyObj.channelId;
  const maiyaChannel = requestChannelsCreate(maiyaId, 'maiyaChannel', true).bodyObj.channelId;

  // Inviting daniel and maiya to the other's channels
  requestChannelInvite(danielToken, danielChannel, maiyaId);
  requestChannelInvite(maiyaToken, maiyaChannel, danielId);

  const object = requestClear();
  expect(object.res.statusCode).toBe(OK);

  expect(requestUserProfile(danielToken, danielId).res.statusCode).toBe(403);
  expect(requestUserProfile(maiyaToken, maiyaId).res.statusCode).toBe(403);

  const danielToken2 = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;

  expect(requestChannelsListAll(danielToken2).bodyObj.channels).toMatchObject([]);
});
