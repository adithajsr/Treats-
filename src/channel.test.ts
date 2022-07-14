import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

let authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
let authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
let authSamuel = ['samuelSchreyer@gmail.com', 'password', 'Sam', 'Schreyer'];

function requestHelper(method:HttpVerb, path: String, payload: object) {
	let qs = {};
	let json = {};

	if (['GET' || 'DELETE'].includes(method) == true) {
		qs = payload;
	}

	else {
		json = payload; 
	}

	const res = request(method, SERVER_URL + path, { qs, json}); //request takes in three arguments
	return JSON.parse(res.getBody('utf-8')); // what does utf-8 do?
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
	return requestHelper('GET', '/auth/register/v2', {email, password, nameFirst, nameLast});
}

function requestChannelDetails(token: string, channelId: number) {
    return requestHelper('GET', '/channel/details/v2', {token, channelId});
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
    return requestHelper('POST', '/channels/create/v2', {token, name, isPublic});
}

function requestChannelMessages(token: string, channelId: number, start: number) {
    return requestHelper('GET', '/channel/messages/v2', {token, channelId, start});
}

function requestMessageSend(token: string, channelId: number, message: string) {
    return requestHelper('POST', '/message/send/v1', {token, channelId, message});
}


test('Invalid channelId', () => {
    requestClear();
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let channelId = requestChannelsCreate(danielToken, 'danielChannel', 0);

    expect(requestChannelMessages(danielToken, channelId/2, 0)).toMatchObject({error: 'error'});

});

test('Start is greater than total number of messages', () => {
    requestClear();

    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let channelId = requestChannelsCreate(danielToken, 'danielChannel');

    requestMessageSendDM(danielToken, dmId, "First message");
    requestMessageSendDM(danielToken, dmId, "Second message");

    expect(requestDmMessages(danielToken, dmId, 4));
});

test('Requesting user is not member of DM', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).token;
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmMessages(samToken, dmId, 0)).toMatchObject({error: 'error'});
});

test('Default case', () => {
    requestClear();
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3])
    let maiyaId = maiyaUser.authId;
    let maiyatoken = maiyaUser.token;
    let dmId = requestDmCreate(danielToken, maiyaId);

    requestMessageSendDM(danielToken, dmId, "First message");
    requestMessageSendDM(danielToken, dmId, "Second message");
    requestMessageSendDM(danielToken, dmId, "Third message");
    requestMessageSendDM(danielToken, dmId, "Fourth message");
    requestMessageSendDM(maiyaToken, dmId, "Fifth message");
    requestMessageSendDM(maiyaToken, dmId, "Sixth message");

    let returnObject = {messages: ["First message, Second message, Third message, Fourth message, Fifth message, Sixth message"], start: 0, end: -1};

    expect(requestDmMessages(danielToken, dmId, 0)).toMatchObject(returnObject);
});

test ('Start at integer > 0', () => {
    requestClear();
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3])
    let maiyaId = maiyaUser.authId;
    let maiyatoken = maiyaUser.token;
    let dmId = requestDmCreate(danielToken, maiyaId);

    requestMessageSendDM(danielToken, dmId, "First message");
    requestMessageSendDM(danielToken, dmId, "Second message");
    requestMessageSendDM(danielToken, dmId, "Third message");
    requestMessageSendDM(danielToken, dmId, "Fourth message");
    requestMessageSendDM(maiyaToken, dmId, "Fifth message");
    requestMessageSendDM(maiyaToken, dmId, "Sixth message");

    let returnObject = {messages: ["First message, Second message, Third message, Fourth message, Fifth message, Sixth message"], start: 3, end: -1};

    expect(requestDmMessages(danielToken, dmId, 3)).toMatchObject(returnObject);
});



