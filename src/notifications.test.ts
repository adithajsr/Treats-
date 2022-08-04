import request from 'sync-request';
import config from './config.json';
import {requestClear} from './users.test';
import {requestAuthRegister} from './auth.test';
import {requestChannelsCreate} from './channels.test';
import {requestChannelInvite} from './other.test';

const OK = 200;
const url = config.url;
const port = config.port;

export function requestNotificationsGet(token: string) {
    const res = request(
      'GET',
      `${url}:${port}/notifications/get/v1`,
      {
        headers:
        { 
          token,
        }
      }
    );
    return {
      res: res,
      bodyObj: JSON.parse(res.body as string),
    };
  }

  export function requestDMCreate(token: string, uIds: number[]) {
    const res = request(
      'POST',
      `${url}:${port}/dm/create/v2`,
      {
        json: { uIds },
        headers: { token },
      }
    );
    return {
      res: res,
      bodyObj: JSON.parse(res.body as string),
    };
  }

//Test data 
const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Samuel', 'Schreyer'];

test("User being added to multiple channels", () => {
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
    
    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung added you to gamingChannel"};
    const expectedValue1 = {channelId: samChannel, dmId: -1, notificationMessage: "samuelschreyer added you to wallowingChannel"};
    const expectedValue = [expectedValue0, expectedValue1];                                                                                     
    expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
    expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});



test("User being added to multiple dms - thirst trap boi", () => {
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


    const expectedValue0 = {channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor, samuelschreyer"};
    const expectedValue1 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer added you to maiyataylor, samuelschreyer"}; //SHOULD BE SAMUELSCHREYER, MAIYATAYLOR

    const maiyaExpectedValue = [expectedValue0, expectedValue1];
    const samExpectedValue = [{channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor, samuelschreyer"}]
    expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(maiyaExpectedValue);
    expect(requestNotificationsGet(samToken).bodyObj).toMatchObject(samExpectedValue);
    expect(requestNotificationsGet(maiyaToken).res.statusCode).toBe(OK);
});



test("User being added to multiple channels and dms", () => {
    requestClear()
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

   
    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung added you to gamingChannel"};
    const expectedValue1 = {channelId: samChannel, dmId: -1, notificationMessage: "samuelschreyer added you to wallowingChannel"};
    const expectedValue2 = {channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor"};
    const expectedValue3 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer added you to maiyataylor, samuelschreyer"}; //should be samuelschreyer, maiyataylor
    const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3];
    expect(requestNotificationsGet(maiyaToken).bodyObj).toMatchObject(expectedValue);
});
/*
test("User being tagged multiple times", () => {
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
    const samId = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.authUserId;

    const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true);
    requestChannelsInvite(danielToken, danielChannel, maiyaId);
    requestChannelsInvite(danielToken, danielChannel, samId);

    requestMessageSend(danielChannel, "@maiya get online to play sum fortnite");
    requestMessageSend(danielChannel, "@maiya @maiya wait how about in 5 mins"); //testing that double tag still only sends one notification
    requestMessageSend(danielChannel, "@maiya ok come online now");

    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung tagged you in gamingChannel: get online to play s"};
    const expectedValue1 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung tagged you in gamingChannel: wait how about in 5 "};
    const expectedValue2 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung tagged you in gamingChannel: ok come online now"};

    const expectedValue = [expectedValue0, expectedValue1, expectedValue2];
});

test("User being added to channels, dms and getting tagged", () => {
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
    const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

    const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true);
    const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true);
    requestChannelInvite(danielToken, danielChannel, maiyaId);
    requestChannelInvite(samToken, samChannel, maiyaId);
    
    const danielDm = requestDMCreate(danielToken, maiyaId).bodyObj.dmId;
    const samDm = requestDMCreate(samToken, maiyaId).bodyObj.dmId;

    requestMessageSend(danielChannel, "@maiya get online to play sum fortnite");
    requestMessageSendDM(samDm, "@maiya ignore daniel come hang out with me bbg");

    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung added you to gamingChannel"};
    const expectedValue1 = {channelId: samChannel, dmId: -1, notificationMessage: "samuelschreyer added you to wallowingChannel"};
    const expectedValue2 = {channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor"};
    const expectedValue3 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer added you to samuelschreyer, maiyataylor"};
    const expectedValue4 = {channelId: danielChannel, dmId: -1, notificationMessage:"danielyung tagged you in gamingChannel: get online to play s"};
    const expectedValue5 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer tagged you in wallowingChannel: ignore daniel come h"};

    const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3, expectedValue4, expectedValue5];
});
*/



