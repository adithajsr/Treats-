/*Array of objects, where each object contains types { messageId, uId, message, timeSent, reacts, isPinned  }*/
//NEED TO UPDATE TOKEN INPUT

import request from 'sync-request';
import config from './config.json';
import { requestClear } from './users.test'
import { requestAuthRegister } from './auth.test'
import { requestChannelsCreate } from './channel.test'
import { requestChannelInvite } from './other.test'
import { requestDMCreate } from './dm.test'
import {requestHelper, requestMessageSend, requestSendDm} from './message.test'


const OK = 200; 
const url = config.url;
const port = config.port;

export function requestSearch(token: string, queryStr: string) {
  const res = request(
    'GET',
    `${url}:${port}/search/v1`,
    {
      qs: {
        token,
        queryStr,
      }
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
const authAnanya = ['ananyaprasad@gmail.com', 'password', 'Ananya', 'Prasad'];

afterEach(() => {
    requestClear();
  });

test('search string is empty', () => {
    requestClear();
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
    const maiyaId = maiyaUser.authUserId;
    const maiyaToken = maiyaUser.token;
    const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;

    requestSendDm(danielToken, dmId, 'First message');
    requestSendDm(danielToken, dmId, 'Second message');
    requestSendDm(danielToken, dmId, 'Third message');
    requestSendDm(danielToken, dmId, 'Fourth message');
    requestSendDm(maiyaToken, dmId, 'Fifth message');
    requestSendDm(maiyaToken, dmId, 'Sixth message');

    expect(requestSearch(maiyaToken, '').res.statusCode).toBe(400);
});

test('search string is over 1000 characters', () => {
    requestClear();
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
    const maiyaId = maiyaUser.authUserId;
    const maiyaToken = maiyaUser.token;
    const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;

    requestSendDm(danielToken, dmId, 'First message');
    requestSendDm(danielToken, dmId, 'Second message');
    requestSendDm(danielToken, dmId, 'Third message');
    requestSendDm(danielToken, dmId, 'Fourth message');
    requestSendDm(maiyaToken, dmId, 'Fifth message');
    requestSendDm(maiyaToken, dmId, 'Sixth message');

    const longAssString = 'haydenillshoutuacoffee'.repeat(50);
    
    expect(requestSearch(maiyaToken, longAssString).res.statusCode).toBe(400);
});

test('search string does not match any messages in channels or dms', () => {
    requestClear();
    
    //creating a channel with daniel in it and sending six messages
    const danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj.token;
    const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;
    requestMessageSend(danielToken, channelId, 'First message');
    requestMessageSend(danielToken, channelId, 'Second message');
    requestMessageSend(danielToken, channelId, 'Third message');
    requestMessageSend(danielToken, channelId, 'Fourth message');
    requestMessageSend(danielToken, channelId, 'Fifth message');
    requestMessageSend(danielToken, channelId, 'Sixth message');

    //maiya creates an account, gets added to a dm with daniel and sends six messages
    const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
    const maiyaId = maiyaUser.authUserId;
    const maiyaToken = maiyaUser.token;
    const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;

    requestSendDm(danielToken, dmId, 'First message');
    requestSendDm(danielToken, dmId, 'Second message');
    requestSendDm(danielToken, dmId, 'Third message');
    requestSendDm(danielToken, dmId, 'Fourth message');
    requestSendDm(maiyaToken, dmId, 'Fifth message');
    requestSendDm(maiyaToken, dmId, 'Sixth message');

    expect(requestSearch(danielToken, 'upcomingbenchpr').bodyObj).toMatchObject([]);
    expect(requestSearch(danielToken, 'Fourth message ').bodyObj).toMatchObject([]);
    
});

test('default case', () => {
    requestClear();
    
    //creating a channel with daniel in it and sending six messages
    const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).bodyObj;
    const danielId = danielUser.authUserId;
    const danielToken = danielUser.token;
    const channelId = requestChannelsCreate(danielToken, 'danielChannel', true).bodyObj.channelId;
    
    
    requestMessageSend(danielToken, channelId, 'aditha so cool yeah');
    requestMessageSend(danielToken, channelId, 'in my opinion');
    requestMessageSend(danielToken, channelId, 'which is a fact no doubt');
    requestMessageSend(danielToken, channelId, 'yeah yeah');
    const messageId1 = requestMessageSend(danielToken, channelId, 'omg hopefully he doesnt see this hehe').messageId;
    const time1 = Math.floor((new Date()).getTime() / 1000);

    requestMessageSend(danielToken, channelId, 'why am i talking to myself :(');

    //maiya creates an account, gets added to a dm with daniel and sends six messages
    const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).bodyObj;
    const maiyaId = maiyaUser.authUserId;
    const maiyaToken = maiyaUser.token;
    const dmId = requestDMCreate(danielToken, [maiyaId]).bodyObj.dmId;


    requestSendDm(danielToken, dmId, 'ur mum');
    requestSendDm(danielToken, dmId, 'is cool');
    const messageId2 = requestSendDm(danielToken, dmId, 'hehe').messageId;
    const time2 = Math.floor((new Date()).getTime() / 1000);
    requestSendDm(danielToken, dmId, ';)');
    requestSendDm(maiyaToken, dmId, 'hey!');
    const messageId3 = requestSendDm(maiyaToken, dmId, 'stfu bitch hehe').messageId;
    const time3 = Math.floor((new Date()).getTime() / 1000);

    //how do I know what time data to input??
    const retObject = requestSearch(danielToken, 'hehe');
    const expectedObj1 = {messageId: messageId1, uId: danielId, message: 'omg hopefully he doesnt see this hehe', timeSent: time1, reacts: 0, isPinned: 0};
    const expectedObj2 = {messageId: messageId2, uId: danielId, message: 'hehe', timeSent: time2, reacts: 0, isPinned: 0};
    const expectedObj3 = {messageId: messageId3, uId: maiyaId, message: 'stfu bitch hehe', timeSent: time3, reacts: 0, isPinned: 0};

    const expectedObj = [expectedObj1, expectedObj2, expectedObj3];
    expect(retObject.bodyObj).toMatchObject(expectedObj);
});



