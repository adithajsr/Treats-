import request from 'sync-request'
import config from './config.json'

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

function requestDmDetails(token: string, dmId: number) {
    return requestHelper('GET', '/dm/details/v1', {token, dmId});
}

function requestDmCreate(token: string, uIds: number[]) {
    return requestHelper('POST', 'dm/create/v1', {token, uIds});
}


//Test case not in interface - still test?
test('Invalid token', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmDetails(danielToken/2, dmId)).toMatchObject({error: 'error'});

});

test('Invalid dmId', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmDetails(danielToken, dmId/2)).toMatchObject({error: 'error'});
});

test('Unauthorised access request', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let SamToken = requestAuthRegister(authSam[0], authSam[1], authSam[2], authSam[3]).token;
    let dmId = requestDmCreate(danielToken, maiyaId);

    expect(requestDmDetails(samToken, dmId)).toMatchObject({error: 'error'});
});

test('Default case', () => {
    let danielToken = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).token;
    let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId
    let dmId = requestDmCreate(danielToken, maiyaId);

    let returnObject = requestDmDetails(danielToken, dmId);

    expect(returnObject.name).toEqual('danielyung, maiyataylor'); // is this how the names are concatenated?
    expectObject(returnObject.members[0].uId).toEqual(danielId); // how do we know which one will be first - same applies for above line
    expectObject(returnObject.members[1].uId).toEqual(maiyaId);

});




