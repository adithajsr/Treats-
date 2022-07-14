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
	return requestHelper('POST', '/auth/register/v2', {email, password, nameFirst, nameLast});
}

function requestDmDetails(token: string, dmId: number) {
    return requestHelper('GET', '/dm/details/v1', {token, dmId});
}

function requestDmCreate(token: string, uIds: number[]) {
    return requestHelper('POST', '/dm/create/v1', {token, uIds});
}

function requestDmMessages(token: string, dmId: number, start: number) {
    return requestHelper('GET', '/dm/messages/v1', {token, dmId, number});
}

function requestMessageSendDM(token: string, dmId: number, message: "") {
    return requestHelper('POST', '/message/senddm/v1', {token, dmId, message});
}


test('Invalid dmId', () => {
    requestClear();
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmMessages(danielToken, dmId/2, 0)).toMatchObject({error: 'error'});

});

test('Start is greater than total number of messages', () => {
    requestClear();
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

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



