import request from 'sync-request';
import config from './config.json';

const OK = 200;

const url = config.url;
const port = config.port;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {},
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
  `${url}:${port}/user/profile/v2`,
  {
    qs: {
      token: token,
      uId: uId
    }
  }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: { token, name, isPublic },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelsListAll() {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v2`,
    {
      qs: {}
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

function requestChannelInvite(InviterAUI: number, channelId: number, InviteeAUI: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: { InviterAUI, channelId, InviteeAUI },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.getBody() as string),
  };
}

test('Clearing users', () => {
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;
  let object = requestClear();
  expect(object.res.statusCode).toBe(OK);
  expect(requestUserProfile(danielToken, danielId).bodyObj).toMatchObject({ error: 'error' });
});


test('Clearing channels containing users', () => {
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  requestChannelsCreate(danielToken, 'danielChannel', true);

  let object = requestClear();
  expect(object.res.statusCode).toBe(OK);

  expect(requestUserProfile(danielToken, danielId).bodyObj).toMatchObject({error: 'error'});

  expect(requestChannelsListAll()).toMatchObject([]);

});

test('Clearing channels containing multiple users', () => {
  let danielUser = requestAuthRegister(authDaniel[0], authDaniel[1],authDaniel[2], authDaniel[3]);
  let maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1],authMaiya[2], authMaiya[3]);

  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;

  let danielChannel = requestChannelsCreate(danielId, 'danielChannel', true).bodyObj.channelId;
  let maiyaChannel = requestChannelsCreate(maiyaId, 'maiyaChannel', true).bodyObj.channelId;

  requestChannelInvite(danielToken, danielChannel, maiyaId);
  requestChannelInvite(maiyaToken, maiyaChannel, danielId);

  let object = requestClear();
  expect(object.res.statusCode).toBe(OK);

  expect(requestUserProfile(danielId, danielId).bodyObj).toMatchObject({error: 'error'});
  expect(requestUserProfile(maiyaId, maiyaId).bodyObj).toMatchObject({error: 'error'});
  expect(requestChannelsListAll()).toMatchObject([]);

});


