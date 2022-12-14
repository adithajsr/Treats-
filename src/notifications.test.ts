import request from 'sync-request';
import config from './config.json';
import { requestClear, requestAuthRegister, requestChannelsCreate } from './test.helpers';
import { requestChannelInvite, requestMessageSendDM, requestDMCreate } from './test.helpers';
import { requestNotificationsGet } from './test.helpers';
import { requestMessageSend } from './message.test';

const OK = 200;
const url = config.url;
const port = config.port;

export function sendPost(path:string, token:string, body: object) {
  const res = request(
    'POST',
      `${url}:${port}/${path}`,
      {
        json: body,
        headers: { token: token }
      }
  );

  if (res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500) {
    return res.statusCode;
  } else {
    return JSON.parse(res.getBody() as string);
  }
}

// Test data
const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Samuel', 'Schreyer'];

test('User being added to multiple channels', () => {
  requestClear();
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

  const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true).bodyObj.channelId;
  const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true).bodyObj.channelId;

  requestChannelInvite(danielToken, danielChannel, maiyaId);
  requestChannelInvite(samToken, samChannel, maiyaId);

  const expectedValue0 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung added you to gamingChannel' };
  const expectedValue1 = { channelId: samChannel, dmId: -1, notificationMessage: 'samuelschreyer added you to wallowingChannel' };
  const expectedValue = [expectedValue0, expectedValue1];
  expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
  expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});

test('User being added to multiple dms - thirst trap boi', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const samUser = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj;
  const samId = samUser.authUserId;
  const samToken = samUser.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;

  const danielDm = requestDMCreate(danielToken, [maiyaId, samId]).bodyObj.dmId;
  const samDm = requestDMCreate(samToken, [maiyaId]).bodyObj.dmId;

  const expectedValue0 = { channelId: -1, dmId: danielDm, notificationMessage: 'danielyung added you to danielyung, maiyataylor, samuelschreyer' };
  const expectedValue1 = { channelId: -1, dmId: samDm, notificationMessage: 'samuelschreyer added you to maiyataylor, samuelschreyer' }; // SHOULD BE SAMUELSCHREYER, MAIYATAYLOR

  const maiyaExpectedValue = [expectedValue0, expectedValue1];
  const samExpectedValue = [{ channelId: -1, dmId: danielDm, notificationMessage: 'danielyung added you to danielyung, maiyataylor, samuelschreyer' }];
  expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(maiyaExpectedValue);
  expect(requestNotificationsGet(samToken).bodyObj).toMatchObject(samExpectedValue);
  expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});

test('User being added to multiple channels and dms', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

  const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true).bodyObj.channelId;
  const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true).bodyObj.channelId;
  requestChannelInvite(danielToken, danielChannel, maiyaId);
  requestChannelInvite(samToken, samChannel, maiyaId);

  const danielDm = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;
  const samDm = requestDMCreate(samToken, [maiyaId]).bodyObj.dmId;

  const expectedValue0 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung added you to gamingChannel' };
  const expectedValue1 = { channelId: samChannel, dmId: -1, notificationMessage: 'samuelschreyer added you to wallowingChannel' };
  const expectedValue2 = { channelId: -1, dmId: danielDm, notificationMessage: 'danielyung added you to danielyung, maiyataylor' };
  const expectedValue3 = { channelId: -1, dmId: samDm, notificationMessage: 'samuelschreyer added you to maiyataylor, samuelschreyer' }; // should be samuelschreyer, maiyataylor
  const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3];
  expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
  expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});

test('User being tagged multiple times', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;
  const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true).bodyObj.channelId;
  requestChannelInvite(danielToken, danielChannel, maiyaId);

  requestMessageSend(danielToken, danielChannel, '@maiyataylor get online to play sum fortnite');
  requestMessageSend(danielToken, danielChannel, '@maiyataylor @maiyataylor wait how about in 5 mins'); // testing that double tag still only sends one notification
  requestMessageSend(danielToken, danielChannel, '@maiyataylor ok come online now');
  requestMessageSend(danielToken, danielChannel, '@idiot hurry tf up');

  const expectedValue0 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung added you to gamingChannel' };
  const expectedValue1 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung tagged you in gamingChannel: @maiyataylor get onl' };
  const expectedValue2 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung tagged you in gamingChannel: @maiyataylor @maiyat' };
  const expectedValue3 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung tagged you in gamingChannel: @maiyataylor ok come' };

  const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3];
  expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
  expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});

test('User being added to channels, dms and getting tagged', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;
  const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

  const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true).bodyObj.channelId;
  const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true).bodyObj.channelId;
  requestChannelInvite(danielToken, danielChannel, maiyaId);
  requestChannelInvite(samToken, samChannel, maiyaId);

  const danielDm = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;
  const samDm = requestDMCreate(samToken, [maiyaId]).bodyObj.dmId;

  requestMessageSend(danielToken, danielChannel, '@maiyataylor get online to play sum fortnite');
  requestMessageSendDM(samToken, samDm, '@maiyataylor ignore daniel come hang out with me bbg');

  const expectedValue0 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung added you to gamingChannel' };
  const expectedValue1 = { channelId: samChannel, dmId: -1, notificationMessage: 'samuelschreyer added you to wallowingChannel' };
  const expectedValue2 = { channelId: -1, dmId: danielDm, notificationMessage: 'danielyung added you to danielyung, maiyataylor' };
  const expectedValue3 = { channelId: -1, dmId: samDm, notificationMessage: 'samuelschreyer added you to maiyataylor, samuelschreyer' };
  const expectedValue4 = { channelId: danielChannel, dmId: -1, notificationMessage: 'danielyung tagged you in gamingChannel: @maiyataylor get onl' };
  const expectedValue5 = { channelId: -1, dmId: samDm, notificationMessage: 'samuelschreyer tagged you in maiyataylor, samuelschreyer: @maiyataylor ignore ' };

  const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3, expectedValue4, expectedValue5];
  expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
  expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});

test('testing reacts', () => {
  requestClear();
  const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
  const maiyaId = maiyaUser.authUserId;
  const maiyaToken = maiyaUser.token;
  const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true).bodyObj.channelId;
  requestChannelInvite(danielToken, danielChannel, maiyaId);

  const messageId = requestMessageSend(danielToken, danielChannel, '@maiyataylor get online to play sum fortnite').messageId;
  const body = { messageId: messageId, reactId: 1 };
  sendPost('message/react/v1', maiyaToken, body);
  expect(requestNotificationsGet(danielToken).bodyObj[0].notificationMessage).toBe('maiyataylor reacted to your message in gamingChannel');
  expect(requestNotificationsGet(danielToken).res.statusCode).toBe(OK);
  requestClear();
});
