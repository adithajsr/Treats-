import request from 'sync-request';
import config from './config.json';

const OK = 200;
const link = config.url + ':' + config.port;

let authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
let authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];
let authSamuel = ['samuelSchreyer@gmail.com', 'password', 'Sam', 'Schreyer']

function requestHelper(method: HttpVerb, path: String, payload: object) {
	let qs = {};
	let json = {};

	if (['GET' || 'DELETE'].includes(method) == true) {
		qs = payload;
	}

	else {
		json = payload; 
	}

	const res = request(method, link + path, { qs, json}); //request takes in three arguments
	return JSON.parse(res.getBody('utf-8')); // what does utf-8 do?
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
	return requestHelper('POST', '/auth/register/v2', {email, password, nameFirst, nameLast});
}

function requestDmCreate(token: string, uIds: number[]) {
    return requestHelper('POST', 'dm/create/v1', {token, uIds});
}

function requestDmLeave(token: string, dmId: number) {
    return requestHelper('POST', 'dm/leave/v1', {token, dmId});
}


test('Testing invalid dmId', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId;
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmLeave(danielToken, dmId/2)).toMatchObject({error: 'error'});
});

test('Non-member attempts to leave', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let samToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]);
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId;
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmLeave(samToken, dmId)).toMatchObject({error: 'error'});
});

test('Default case', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

    let returnObject = requestDmDetails(danielToken, dmId);

    expect(returnObject.name).toEqual('danielyung, maiyataylor'); 

    requestDmLeave(danielToken, dmId);

    let returnObject = requestDmDetails(danielToken, dmId);

    expectObject(returnObject.members[0].uId).toEqual(maiyaId);

});

test('When all members leave', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    
    let maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3])
    let maiyaToken = maiyaUser.token;
    let maiyaId = maiyaUser.authUserId;

    let dmId = requestDmCreate(danielToken, maiyaId);

    let returnObject = requestDmDetails(danielToken, dmId);

    expect(returnObject.name).toEqual('danielyung, maiyataylor'); 

    requestDmLeave(danielToken, dmId);
    requestDmLeave(maiyaToken, dmId);

    let returnObject = requestDmDetails(danielToken, dmId); // this token would cease to exist or be valid in the system so is 
                                                            //it even possible to test when all members leave?
    expectObject(returnObject.members).toMatchObject([]);
});