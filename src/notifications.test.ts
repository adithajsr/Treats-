
//Notifications returns something if user was tagged in a message or if someone
//reacted to their message or if user was added to a channel/dm

/*Array of objects, where each object contains types { channelId, dmId, notificationMessage } where 
      
        channelId is the id of the channel that the event happened in, and is -1 if it is being sent to a DM
        dmId is the DM that the event happened in, and is -1 if it is being sent to a channel
        notificationMessage is a string of the following format for each trigger action:
        
          tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"
          reacted message: "{User’s handle} reacted to your message in {channel/DM name}"
          added to a channel/DM: "{User’s handle} added you to {channel/DM name}"
*/

//NEED TO UNDERSTAND HOW TOKENS WORK AND THEN CREATE TESTS WITH INVALID TOKEN + 
//WHERE MULTIPLE USERS ARE TAGGED BUT NOTIFICATION SHOULD ONLY SHOW FOR THE ONE USER
//BEING TAGGED
import request from 'sync-request';
import config from './config.json';
import {requestClear} from './users.test'
import {requestAuthRegister} from './auth.test'
import {requestChannelsCreate} from './channel.test'
import {requestChannelInvite} from './other.test'

const OK = 200;
const url = config.url;
const port = config.port;

//Test data 
const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
const authSam = ['samuelSchreyer@gmail.com', 'password', 'Samuel', 'Schreyer'];

//Not sure if this is correct
export function requestNotificationsGet() {
    const res = request(
      'GET',
      `${url}:${port}/notifications/get/v1`,
      {
        qs: {
        }
      }
    );
    return {
      res: res,
      bodyObj: JSON.parse(res.body as string),
    };
  }

test("User being added to multiple channels", () => {
    requestClear();
    const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

    const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true);
    const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true);
    requestChannelInvite(danielToken, danielChannel, maiyaId);
    requestChannelInvite(samToken, samChannel, maiyaId);
    
    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung added you to gamingChannel"};
    const expectedValue1 = {channelId: samChannel, dmId: -1, notificationMessage: "samuelschreyer added you to wallowingChannel"};
    const expectedValue = [expectedValue0, expectedValue1];      
                                                                                              
    expect(requestNotificationsGet().bodyObj).toMatchObject(expectedValue);
    expect(requestNotificationsGet.res.statusCode).toBe(OK);
});

test("User being added to multiple dms - thirst trap boi", () => {
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
    const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;
    const danielDm = requestDMCreate(danielToken, maiyaId).bodyObj.dmId;
    const samDm = requestDMCreate(samToken, maiyaId).bodyObj.dmId;
    
    const expectedValue0 = {channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor"};
    const expectedValue1 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer added you to samuelschreyer, maiyataylor"};

    const expectedValue = [expectedvalue0, expectedValue1];
    expectedValue(requestNotificationsGet().bodyObj).toMatchObject(expectedValue);
    expect(requestNotificationsGet.res.statusCode).toBe(OK);
});

test("User being added to multiple channels and dms", () => {
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj.authUserId;
    const samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).bodyObj.token;

    const danielChannel = requestChannelsCreate(danielToken, 'gamingChannel', true);
    const samChannel = requestChannelsCreate(samToken, 'wallowingChannel', true);
    requestChannelInvite(danielToken, danielChannel, maiyaId);
    requestChannelInvite(samToken, samChannel, maiyaId);
    
    const danielDm = requestDMCreate(danielToken, maiyaId).bodyObj.dmId;
    const samDm = requestDMCreate(samToken, maiyaId).bodyObj.dmId;

    const expectedValue0 = {channelId: danielChannel, dmId: -1, notificationMessage: "danielyung added you to gamingChannel"};
    const expectedValue1 = {channelId: samChannel, dmId: -1, notificationMessage: "samuelschreyer added you to wallowingChannel"};
    const expectedValue2 = {channelId: -1, dmId: danielDm, notificationMessage: "danielyung added you to danielyung, maiyataylor"};
    const expectedValue3 = {channelId: -1, dmId: samDm, notificationMessage: "samuelschreyer added you to samuelschreyer, maiyataylor"};
    const expectedValue = [expectedValue0, expectedValue1, expectedValue2, expectedValue3];
});

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




